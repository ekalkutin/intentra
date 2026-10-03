import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import { ProjectId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import { givenAccount } from '../../../../testing/account.fixtures.js';
import { givenOpenWorkspaceCreation } from '../../../../testing/workspace-creation.fixtures.js';
import { WorkspaceModule } from '../../../../workspace.module.js';
import { KnowledgeService } from '../../../knowledge/index.js';
import { ProjectsService, WorkspacesService } from '../../../tenancy/index.js';
import { publishableUnpublished } from '../../domain/entities/agents.fixtures.js';
import { AgentsVersion, AnalysisRun } from '../../domain/entities/index.js';
import {
  AnalysisRunFailure,
  AnalysisRunScope,
  AnalysisRunStatus,
} from '../../domain/value-objects/index.js';
import { AnalysisRunBusyException } from '../exceptions/index.js';
import {
  AgentsVersionRepository,
  AnalysisRunRepository,
  Auditor,
} from '../ports/outbound/index.js';

import { AnalysisRunsService } from './analysis-runs.service.js';
import { ProviderKeyService } from './provider-key.service.js';

function startRun(projectId = new ProjectId()): AnalysisRun {
  return AnalysisRun.start({
    workspaceId: new WorkspaceId().value,
    projectId: projectId.value,
    scope: AnalysisRunScope.WholeProject,
    startedBy: null,
  });
}

describe('AnalysisRunsService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({
      imports: [
        WorkspaceModule.register({
          agents: {
            providerKeyEncryptionKey: Buffer.alloc(32, 7).toString('base64'),
          },
        }),
      ],
    });
  });

  beforeEach(() => givenOpenWorkspaceCreation(app));

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.clearDatabase();
  });

  afterAll(() => app?.close());

  function save(run: AnalysisRun): Promise<void> {
    return app
      .get(UnitOfWork)
      .run(() => app.get(AnalysisRunRepository).save(run));
  }

  it('marks the runs a stopped process left running as interrupted, keeping what they recorded', async () => {
    // Arrange
    const left = startRun();
    await save(left);
    const done = startRun();
    done.complete({ questionKeys: ['TBD-1'], stepLimitReached: false });
    await save(done);

    // Act
    await app.get(AnalysisRunsService).onApplicationBootstrap();

    // Assert
    const runs = app.get(AnalysisRunRepository);
    const interrupted = await runs.getOne({ id: left.id });
    expect(interrupted.status).toBe(AnalysisRunStatus.Failed);
    expect(interrupted.failure).toBe(AnalysisRunFailure.Interrupted);
    const untouched = await runs.getOne({ id: done.id });
    expect(untouched.status).toBe(AnalysisRunStatus.Completed);
    expect(untouched.questionKeys).toEqual(['TBD-1']);
  });

  it('keeps one running run per Project, whoever saves the second', async () => {
    // Arrange
    const projectId = new ProjectId();
    await save(startRun(projectId));

    // Act
    const saving = save(startRun(projectId));

    // Assert
    await expect(saving).rejects.toBeInstanceOf(AnalysisRunBusyException);
  });

  describe('nightly', () => {
    type Setup = { ada: Actor; workspaceId: string; projectId: string };

    /** Ada owns the Workspace and its Project, with a Provider Key and Published Agents; the Auditor finds nothing. */
    async function setUp({ providerKey = true } = {}): Promise<Setup> {
      const ada = await givenAccount(app, 'ada@example.com');
      const workspace = await app
        .get(WorkspacesService)
        .create(ada, { name: 'Acme', slug: 'acme' });
      const project = await app
        .get(ProjectsService)
        .create(ada, workspace.id, { name: 'Billing', slug: 'billing' });
      if (providerKey) {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(
          new Response('{}', { status: 200 }),
        );
        await app
          .get(ProviderKeyService)
          .set(ada, workspace.id, { key: 'sk-or-v1-0123456789abcdef' });
      }
      const version = AgentsVersion.publish({
        number: 1,
        content: publishableUnpublished().content,
        note: null,
        publisherAccountId: ada.accountId,
        publisherEmail: ada.email,
      });
      await app
        .get(UnitOfWork)
        .run(() => app.get(AgentsVersionRepository).save(version));
      vi.spyOn(app.get(Auditor), 'audit').mockResolvedValue({
        failure: null,
        questionKeys: [],
        stepLimitReached: false,
      });

      return { ada, workspaceId: workspace.id, projectId: project.id };
    }

    async function turnOn({ ada, workspaceId, projectId }: Setup) {
      await app
        .get(AnalysisRunsService)
        .changeSchedule(ada, workspaceId, projectId, { enabled: true });
    }

    async function approveRequirement(
      { ada, workspaceId, projectId }: Setup,
      title: string,
    ): Promise<string> {
      const knowledge = app.get(KnowledgeService);
      const caller = { actor: ada, agent: null };
      const recorded = await knowledge.record(caller, workspaceId, projectId, {
        kind: 'requirement',
        title,
        rationale: null,
        supersedes: null,
        links: [],
        fields: {
          statement: title,
          type: 'functional',
          priority: null,
          acceptanceCriteria: [],
        },
      });
      await knowledge.approve(caller, workspaceId, projectId, recorded.key, {
        version: recorded.version,
      });

      return recorded.key;
    }

    async function runsOf({ ada, workspaceId, projectId }: Setup) {
      const page = await app
        .get(AnalysisRunsService)
        .list(ada, workspaceId, projectId, { take: 20, offset: 0 });

      return page.items;
    }

    it('checks the whole Project the first night, as the schedule', async () => {
      // Arrange
      const setup = await setUp();
      await turnOn(setup);

      // Act
      await app.get(AnalysisRunsService).runScheduled();

      // Assert
      const runs = await runsOf(setup);
      expect(runs).toMatchObject([
        {
          scope: 'whole-project',
          startedBy: null,
          status: 'completed',
          changedKeys: [],
        },
      ]);
    });

    it('then checks only what was approved since the last completed run, and nothing when nothing changed', async () => {
      // Arrange
      const setup = await setUp();
      await turnOn(setup);
      await app.get(AnalysisRunsService).runScheduled();
      await app.get(AnalysisRunsService).runScheduled();
      const key = await approveRequirement(setup, 'PDF export');

      // Act
      await app.get(AnalysisRunsService).runScheduled();

      // Assert
      const runs = await runsOf(setup);
      expect(runs.map(run => [run.scope, run.changedKeys])).toEqual([
        ['changes', [key]],
        ['whole-project', []],
      ]);
      expect(vi.mocked(app.get(Auditor).audit)).toHaveBeenLastCalledWith(
        expect.objectContaining({
          changes: { approved: [key], retired: [] },
        }),
      );
    });

    it('leaves a Project alone while its schedule is off', async () => {
      // Arrange
      const setup = await setUp();

      // Act
      await app.get(AnalysisRunsService).runScheduled();

      // Assert
      expect(await runsOf(setup)).toEqual([]);
    });

    it('tells why a schedule that is on cannot run', async () => {
      // Arrange
      const setup = await setUp({ providerKey: false });
      await turnOn(setup);

      // Act
      const schedule = await app
        .get(AnalysisRunsService)
        .schedule(setup.ada, setup.workspaceId, setup.projectId);
      await app.get(AnalysisRunsService).runScheduled();

      // Assert
      expect(schedule).toMatchObject({
        enabled: true,
        blockedBy: 'provider-key-missing',
        access: { canChange: true },
      });
      expect(await runsOf(setup)).toEqual([]);
    });
  });
});
