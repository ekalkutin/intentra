import { MockEmbeddingModelV4 } from 'ai/test';
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
import {
  AnalysisRunBusyException,
  ModelUnavailableException,
} from '../exceptions/index.js';
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
    scope: AnalysisRunScope.Unchecked,
    startedBy: null,
  });
}

/** Every text reads as the same meaning: Similar Items are then every other item. */
const sameMeaning = new MockEmbeddingModelV4({
  maxEmbeddingsPerCall: null,
  doEmbed: async ({ values }) => ({
    embeddings: values.map(() => [1, 0]),
    warnings: [],
  }),
});

describe('AnalysisRunsService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({
      imports: [
        WorkspaceModule.register({
          agents: {
            providerKeyEncryptionKey: Buffer.alloc(32, 7).toString('base64'),
          },
          knowledge: { embeddingModel: () => sameMeaning },
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
    done.checkOne(['TBD-1']);
    done.complete();
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
    vi.spyOn(app.get(Auditor), 'judge').mockResolvedValue([]);

    return { ada, workspaceId: workspace.id, projectId: project.id };
  }

  async function turnOn({ ada, workspaceId, projectId }: Setup) {
    await app
      .get(AnalysisRunsService)
      .changeSchedule(ada, workspaceId, projectId, { enabled: true });
  }

  async function recordRequirement(
    { ada, workspaceId, projectId }: Setup,
    title: string,
    links: { type: 'depends-on'; key: string }[] = [],
  ): Promise<string> {
    const recorded = await app
      .get(KnowledgeService)
      .record({ actor: ada, agent: null }, workspaceId, projectId, {
        kind: 'requirement',
        title,
        rationale: null,
        supersedes: null,
        links,
        fields: {
          statement: title,
          type: 'functional',
          priority: null,
          acceptanceCriteria: [],
        },
      });

    return recorded.key;
  }

  async function listRuns({ ada, workspaceId, projectId }: Setup) {
    return app
      .get(AnalysisRunsService)
      .list(ada, workspaceId, projectId, { take: 20, offset: 0 });
  }

  /** Starts a run by hand and waits until it is through. */
  async function runByHand(
    setup: Setup,
    scope: 'unchecked' | 'whole-project' = 'unchecked',
  ) {
    const service = app.get(AnalysisRunsService);
    const started = await service.start(
      setup.ada,
      setup.workspaceId,
      setup.projectId,
      { scope },
    );
    for (;;) {
      const run = await service.get(
        setup.ada,
        setup.workspaceId,
        setup.projectId,
        started.id,
      );
      if (run.status !== 'running') {
        return run;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  describe('by hand', () => {
    it('judges each item with what it links to, what links to it and its Similar Items', async () => {
      // Arrange
      const setup = await setUp();
      const base = await recordRequirement(setup, 'Export a report');
      const pdf = await recordRequirement(setup, 'PDF export', [
        { type: 'depends-on', key: base },
      ]);

      // Act
      const run = await runByHand(setup);

      // Assert
      expect(run).toMatchObject({
        scope: 'unchecked',
        status: 'completed',
        itemCount: 2,
        checkedCount: 2,
      });
      const groups = vi
        .mocked(app.get(Auditor).judge)
        .mock.calls.map(([{ group }]) => [
          group.item.key,
          group.around.map(item => item.key),
        ]);
      expect(groups).toEqual(
        expect.arrayContaining([
          [base, [pdf]],
          [pdf, [base]],
        ]),
      );
    });

    it('records each finding as an Open Question concerning the group, the item under check always among them', async () => {
      // Arrange
      const setup = await setUp();
      const key = await recordRequirement(setup, 'PDF export');
      vi.mocked(app.get(Auditor).judge).mockResolvedValue([
        {
          title: 'Which viewer',
          question: 'Which PDF viewers must open the file?',
          rationale: `${key} names no viewer`,
          concerns: ['REQ-99'],
        },
      ]);

      // Act
      const run = await runByHand(setup);

      // Assert
      const [questionKey] = run.questionKeys;
      const question = await app
        .get(KnowledgeService)
        .get(
          { actor: setup.ada, agent: null },
          setup.workspaceId,
          setup.projectId,
          questionKey!,
        );
      expect(question).toMatchObject({
        kind: 'open-question',
        status: 'draft',
        source: 'analysis-run',
        fields: { question: 'Which PDF viewers must open the file?' },
        links: [{ type: 'concerns', key }],
      });
      expect((await listRuns(setup)).coverage).toEqual({
        checked: 1,
        total: 1,
      });
    });

    it('looks again only at what changed since, unless a Maintainer asks for the whole Project', async () => {
      // Arrange
      const setup = await setUp();
      await recordRequirement(setup, 'PDF export');
      await runByHand(setup);
      const added = await recordRequirement(setup, 'CSV export');

      // Act
      const unchecked = await runByHand(setup);
      const whole = await runByHand(setup, 'whole-project');

      // Assert
      expect(unchecked).toMatchObject({ itemCount: 1, checkedCount: 1 });
      expect(whole).toMatchObject({
        scope: 'whole-project',
        itemCount: 2,
        checkedCount: 2,
      });
      expect(
        vi.mocked(app.get(Auditor).judge).mock.calls[1]![0].group.item.key,
      ).toBe(added);
    });

    it('stops when the model is unavailable, leaving the items it did not reach Unchecked', async () => {
      // Arrange
      const setup = await setUp();
      await recordRequirement(setup, 'PDF export');
      await recordRequirement(setup, 'CSV export');
      vi.mocked(app.get(Auditor).judge)
        .mockResolvedValueOnce([])
        .mockImplementationOnce(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new ModelUnavailableException()), 50),
            ),
        );

      // Act
      const run = await runByHand(setup);

      // Assert
      expect(run).toMatchObject({
        status: 'failed',
        failure: 'model-unavailable',
        itemCount: 2,
        checkedCount: 1,
      });
      expect((await listRuns(setup)).coverage).toEqual({
        checked: 1,
        total: 2,
      });
    });
  });

  describe('nightly', () => {
    it('checks the Unchecked items, and leaves the Project alone while none are', async () => {
      // Arrange
      const setup = await setUp();
      await turnOn(setup);
      await recordRequirement(setup, 'PDF export');
      await app.get(AnalysisRunsService).runScheduled();
      await app.get(AnalysisRunsService).runScheduled();
      await recordRequirement(setup, 'CSV export');

      // Act
      await app.get(AnalysisRunsService).runScheduled();

      // Assert
      const { items } = await listRuns(setup);
      expect(
        items.map(run => [run.scope, run.startedBy, run.itemCount]),
      ).toEqual([
        ['unchecked', null, 1],
        ['unchecked', null, 1],
      ]);
    });

    it('leaves a Project alone while its schedule is off', async () => {
      // Arrange
      const setup = await setUp();
      await recordRequirement(setup, 'PDF export');

      // Act
      await app.get(AnalysisRunsService).runScheduled();

      // Assert
      expect((await listRuns(setup)).items).toEqual([]);
    });

    it('tells why a schedule that is on cannot run', async () => {
      // Arrange
      const setup = await setUp({ providerKey: false });
      await turnOn(setup);
      await recordRequirement(setup, 'PDF export');

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
      expect((await listRuns(setup)).items).toEqual([]);
    });
  });
});
