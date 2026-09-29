import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import type {
  CallerDto,
  KnowledgeLinkDto,
  RecordKnowledgeItemDto,
} from '@intentra/contracts/workspace';
import { TestingApp } from '@intentra/platform-testing';
import { AccountId, UnitOfWork } from '@intentra/shared-kernel';

import { WorkspaceModule } from '../../../../workspace.module.js';
import {
  Member,
  MemberRepository,
  ProjectRole,
  ProjectRolesService,
  ProjectsService,
  WorkspacesService,
} from '../../../tenancy/index.js';
import {
  DependenciesNotApprovedException,
  InvalidLinkException,
  KnowledgeConfirmationForbiddenException,
  KnowledgeItemLinkedException,
  KnowledgeItemNeedsReviewException,
  LinkTargetNotCurrentException,
  LinkTargetNotFoundException,
} from '../../domain/exceptions/index.js';

import { KnowledgeService } from './knowledge.service.js';

function actor(email: string): Actor {
  return { accountId: new AccountId().value, email };
}

function person(actor: Actor): CallerDto {
  return { actor, agent: null };
}

function requirement(
  statement: string,
  links: KnowledgeLinkDto[] = [],
  supersedes: string | null = null,
): RecordKnowledgeItemDto {
  return {
    kind: 'requirement',
    title: statement,
    rationale: null,
    supersedes,
    links,
    fields: { statement, type: null, priority: null, acceptanceCriteria: [] },
  };
}

function term(title: string): RecordKnowledgeItemDto {
  return {
    kind: 'term',
    title,
    rationale: null,
    supersedes: null,
    links: [],
    fields: {
      definition: `What ${title} means`,
      sort: null,
      synonymsToAvoid: [],
    },
  };
}

const firstPage = { take: 50, offset: 0 };

describe('KnowledgeService Links and Needs Review', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  type Setup = {
    ada: CallerDto;
    bob: CallerDto;
    record: (data: RecordKnowledgeItemDto) => Promise<string>;
    approve: (key: string, version?: number) => Promise<void>;
    knowledge: (
      method: 'get' | 'dependencies',
      key: string,
      caller?: CallerDto,
    ) => Promise<unknown>;
    workspaceId: string;
    projectId: string;
  };

  /** Ada owns the Workspace and is the Project's Maintainer; Bob is its Contributor. */
  async function setUp(): Promise<Setup> {
    const adaActor = actor('ada@example.com');
    const bobActor = actor('bob@example.com');
    const workspace = await app
      .get(WorkspacesService)
      .create(adaActor, { name: 'Acme', slug: 'acme' });
    const member = Member.join({
      workspaceId: workspace.id,
      accountId: bobActor.accountId,
      email: bobActor.email,
    });
    await app.get(UnitOfWork).run(() => app.get(MemberRepository).save(member));
    const project = await app
      .get(ProjectsService)
      .create(adaActor, workspace.id, { name: 'Billing', slug: 'billing' });
    await app
      .get(ProjectRolesService)
      .change(adaActor, workspace.id, project.id, member.id.value, {
        role: ProjectRole.Contributor.value as 'contributor',
      });
    const ada = person(adaActor);
    const knowledgeService = app.get(KnowledgeService);

    return {
      ada,
      bob: person(bobActor),
      workspaceId: workspace.id,
      projectId: project.id,
      record: async data =>
        (await knowledgeService.record(ada, workspace.id, project.id, data))
          .key,
      approve: async (key, version = 1) => {
        await knowledgeService.approve(ada, workspace.id, project.id, key, {
          version,
        });
      },
      knowledge: (method, key, caller = ada) =>
        knowledgeService[method](caller, workspace.id, project.id, key),
    };
  }

  describe('recording', () => {
    it('keeps the Links a Draft is recorded with', async () => {
      // Arrange
      const { record, knowledge } = await setUp();
      await record(term('Invoice'));
      await record(requirement('Export an invoice'));

      // Act
      const key = await record(
        requirement('A button exports it', [
          { type: 'depends-on', key: 'REQ-1' },
          { type: 'uses-term', key: 'TERM-1' },
        ]),
      );

      // Assert
      expect(await knowledge('get', key)).toMatchObject({
        links: [
          { type: 'depends-on', key: 'REQ-1' },
          { type: 'uses-term', key: 'TERM-1' },
        ],
      });
    });

    it.each([
      [
        'to the wrong Kind',
        [{ type: 'uses-term', key: 'REQ-1' }],
        InvalidLinkException,
      ],
      [
        'to a missing item',
        [{ type: 'depends-on', key: 'REQ-9' }],
        LinkTargetNotFoundException,
      ],
      [
        'to a Rejected item',
        [{ type: 'depends-on', key: 'REQ-2' }],
        LinkTargetNotCurrentException,
      ],
    ] as const)('refuses a Link %s', async (_case, links, exception) => {
      // Arrange
      const { ada, record, workspaceId, projectId } = await setUp();
      await record(requirement('Export an invoice'));
      await record(requirement('Print an invoice'));
      await app
        .get(KnowledgeService)
        .reject(ada, workspaceId, projectId, 'REQ-2', {
          version: 1,
          reason: null,
        });

      // Act
      const recording = record(requirement('A button', [...links]));

      // Assert
      await expect(recording).rejects.toBeInstanceOf(exception);
    });
  });

  describe('approving together', () => {
    it('refuses to approve an item before what it depends on', async () => {
      // Arrange
      const { record, approve } = await setUp();
      await record(requirement('Export an invoice'));
      await record(
        requirement('A button', [{ type: 'depends-on', key: 'REQ-1' }]),
      );

      // Act
      const approving = approve('REQ-2');

      // Assert
      await expect(approving).rejects.toBeInstanceOf(
        DependenciesNotApprovedException,
      );
      await expect(approving).rejects.toThrow(/REQ-1/);
    });

    it('approves an item together with the Drafts it depends on', async () => {
      // Arrange
      const { ada, record, workspaceId, projectId } = await setUp();
      await record(requirement('Export an invoice'));
      await record(
        requirement('A button', [{ type: 'depends-on', key: 'REQ-1' }]),
      );

      // Act
      const approved = await app
        .get(KnowledgeService)
        .approveTogether(ada, workspaceId, projectId, {
          items: [
            { key: 'REQ-2', version: 1 },
            { key: 'REQ-1', version: 1 },
          ],
        });

      // Assert
      expect(approved.map(({ key, status }) => [key, status])).toEqual([
        ['REQ-2', 'approved'],
        ['REQ-1', 'approved'],
      ]);
    });
  });

  describe('dependencies', () => {
    it('gives the whole cascade, each item once, cycles included', async () => {
      // Arrange
      const { record, knowledge, ada, workspaceId, projectId } = await setUp();
      await record(requirement('Pay by card'));
      await record(
        requirement('A pay button', [{ type: 'depends-on', key: 'REQ-1' }]),
      );
      await record(
        requirement('Pay an invoice', [{ type: 'depends-on', key: 'REQ-2' }]),
      );
      await app
        .get(KnowledgeService)
        .edit(ada, workspaceId, projectId, 'REQ-1', {
          kind: 'requirement',
          version: 1,
          links: [{ type: 'depends-on', key: 'REQ-3' }],
        });

      // Act
      const cascade = await knowledge('dependencies', 'REQ-3');

      // Assert
      expect(cascade).toMatchObject({
        items: [
          { key: 'REQ-3' },
          { key: 'REQ-2' },
          { key: 'REQ-1', version: 2 },
        ],
        links: [
          { from: 'REQ-3', to: 'REQ-2' },
          { from: 'REQ-2', to: 'REQ-1' },
          { from: 'REQ-1', to: 'REQ-3' },
        ],
      });
    });
  });

  describe('Needs Review', () => {
    /** REQ-1 approved; REQ-2 depends on it; TERM-1 used by REQ-3; REQ-4 depends on REQ-2. All approved. */
    async function approveChain(setup: Setup): Promise<void> {
      const { record, approve } = setup;
      await record(requirement('Pay by card'));
      await approve('REQ-1');
      await record(
        requirement('A pay button', [{ type: 'depends-on', key: 'REQ-1' }]),
      );
      await approve('REQ-2');
      await record(term('Invoice'));
      await approve('TERM-1');
      await record(
        requirement('Invoices', [{ type: 'uses-term', key: 'TERM-1' }]),
      );
      await approve('REQ-3');
      await record(
        requirement('Pay an invoice', [{ type: 'depends-on', key: 'REQ-2' }]),
      );
      await approve('REQ-4');
    }

    it('marks what depends on a replaced item, one step, and not what uses a replaced Term', async () => {
      // Arrange
      const setup = await setUp();
      const { record, approve, knowledge, ada, workspaceId, projectId } = setup;
      await approveChain(setup);
      await record(requirement('Pay by card or SBP', [], 'REQ-1'));
      await record({ ...term('Invoice'), supersedes: 'TERM-1' });

      // Act
      await approve('REQ-5');
      await approve('TERM-2');

      // Assert
      expect(await knowledge('get', 'REQ-2')).toMatchObject({
        needsReview: true,
        reviewCauses: ['REQ-1'],
        access: { canConfirm: true },
      });
      expect(await knowledge('get', 'REQ-4')).toMatchObject({
        needsReview: false,
        dependencyNeedsReview: true,
      });
      expect(await knowledge('get', 'REQ-3')).toMatchObject({
        needsReview: false,
      });
      const marked = await app
        .get(KnowledgeService)
        .list(ada, workspaceId, projectId, { needsReview: true, ...firstPage });
      expect(marked.items.map(({ key }) => key)).toEqual(['REQ-2']);
    });

    it('moves the Link onto the replacement when a Maintainer confirms', async () => {
      // Arrange
      const setup = await setUp();
      const { record, approve, knowledge, ada, bob, workspaceId, projectId } =
        setup;
      await approveChain(setup);
      await record(requirement('Pay by card or SBP', [], 'REQ-1'));
      await approve('REQ-5');
      const knowledgeService = app.get(KnowledgeService);
      const marked = (await knowledge('get', 'REQ-2')) as { version: number };

      // Act
      const [byContributor] = await Promise.allSettled([
        knowledgeService.confirm(bob, workspaceId, projectId, 'REQ-2', {
          version: marked.version,
        }),
      ]);
      const confirmed = await knowledgeService.confirm(
        ada,
        workspaceId,
        projectId,
        'REQ-2',
        { version: marked.version },
      );

      // Assert
      expect(byContributor).toMatchObject({
        status: 'rejected',
        reason: expect.any(KnowledgeConfirmationForbiddenException),
      });
      expect(confirmed).toMatchObject({
        needsReview: false,
        links: [{ type: 'depends-on', key: 'REQ-5' }],
      });
      expect(await knowledge('get', 'REQ-4')).toMatchObject({
        dependencyNeedsReview: false,
      });
    });

    it('keeps a marked Draft from being approved until it is confirmed or relinked', async () => {
      // Arrange
      const { record, approve, ada, workspaceId, projectId } = await setUp();
      await record(requirement('Pay by card'));
      await approve('REQ-1');
      await record(
        requirement('A pay button', [{ type: 'depends-on', key: 'REQ-1' }]),
      );
      await record(requirement('Pay by card or SBP', [], 'REQ-1'));
      await approve('REQ-3');

      // Act
      const approving = approve('REQ-2', 2);

      // Assert
      await expect(approving).rejects.toBeInstanceOf(
        KnowledgeItemNeedsReviewException,
      );
      await app
        .get(KnowledgeService)
        .edit(ada, workspaceId, projectId, 'REQ-2', {
          kind: 'requirement',
          version: 2,
          links: [{ type: 'depends-on', key: 'REQ-3' }],
        });
      await expect(approve('REQ-2', 3)).resolves.toBeUndefined();
    });
  });

  describe('deleting', () => {
    it('refuses to delete a Draft another item links to', async () => {
      // Arrange
      const { record, ada, workspaceId, projectId } = await setUp();
      await record(term('Invoice'));
      await record(
        requirement('Invoices', [{ type: 'uses-term', key: 'TERM-1' }]),
      );

      // Act
      const deleting = app
        .get(KnowledgeService)
        .delete(ada, workspaceId, projectId, 'TERM-1', { version: 1 });

      // Assert
      await expect(deleting).rejects.toBeInstanceOf(
        KnowledgeItemLinkedException,
      );
      await expect(deleting).rejects.toThrow(/REQ-1/);
    });
  });

  describe('open questions', () => {
    it('is answered by the Approved items that answer it', async () => {
      // Arrange
      const { record, approve, knowledge } = await setUp();
      await record({
        kind: 'open-question',
        title: 'Refunds',
        rationale: null,
        supersedes: null,
        links: [],
        fields: { question: 'Do we refund card payments?' },
      });
      await record(
        requirement('Refund card payments within 14 days', [
          { type: 'answers', key: 'TBD-1' },
        ]),
      );
      const open = await knowledge('get', 'TBD-1');

      // Act
      await approve('REQ-1');

      // Assert
      expect(open).toMatchObject({ answeredBy: [] });
      expect(await knowledge('get', 'TBD-1')).toMatchObject({
        answeredBy: ['REQ-1'],
      });
    });
  });
});
