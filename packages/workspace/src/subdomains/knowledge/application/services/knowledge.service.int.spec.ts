import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import type { RecordKnowledgeItemDto } from '@intentra/contracts/workspace';
import { TestingApp } from '@intentra/platform-testing';
import {
  AccountId,
  ProjectId,
  UnitOfWork,
  WorkspaceId,
} from '@intentra/shared-kernel';

import { WorkspaceModule } from '../../../../workspace.module.js';
import {
  Member,
  MemberRepository,
  MembersService,
  ProjectRole,
  ProjectRolesService,
  ProjectsService,
  WorkspacesService,
} from '../../../tenancy/index.js';
import {
  DraftApprovalForbiddenException,
  DraftDeletionForbiddenException,
  DraftEditingForbiddenException,
  KnowledgeItemChangedException,
  KnowledgeItemNotDraftException,
  KnowledgeKindMismatchException,
  KnowledgeRecordingForbiddenException,
} from '../../domain/exceptions/index.js';
import { KnowledgeKind } from '../../domain/value-objects/index.js';
import { KnowledgeItemNotFoundException } from '../exceptions/index.js';
import {
  KnowledgeItemRepository,
  KnowledgeKeyCounter,
} from '../ports/outbound/index.js';

import { KnowledgeService } from './knowledge.service.js';

function actor(email: string): Actor {
  return { accountId: new AccountId().value, email };
}

function term(title: string): RecordKnowledgeItemDto {
  return {
    kind: 'term',
    title,
    rationale: null,
    fields: {
      definition: `What ${title} means`,
      sort: null,
      synonymsToAvoid: [],
    },
  };
}

const requirement: RecordKnowledgeItemDto = {
  kind: 'requirement',
  title: 'PDF export',
  rationale: 'Ada: "customers print reports"',
  fields: {
    statement: 'Export a report to PDF',
    type: 'functional',
    priority: 'must',
    acceptanceCriteria: ['The file opens in a PDF viewer'],
  },
};

const decision: RecordKnowledgeItemDto = {
  kind: 'decision',
  title: 'MongoDB',
  rationale: null,
  fields: {
    decision: 'Store data in MongoDB',
    area: 'architecture',
    context: null,
    rejectedAlternatives: [{ alternative: 'PostgreSQL', reason: null }],
  },
};

const firstPage = { take: 50, offset: 0 };

describe('KnowledgeService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  type Setup = {
    workspaceId: string;
    projectId: string;
    ada: Actor;
    adaId: string;
    bob: Actor;
    bobId: string;
  };

  /** Ada owns the Workspace and is the Project's Maintainer; Bob holds the given Project Role. */
  async function setUp(
    bobRole: ProjectRole = ProjectRole.Viewer,
  ): Promise<Setup> {
    const ada = actor('ada@example.com');
    const bob = actor('bob@example.com');
    const workspace = await app
      .get(WorkspacesService)
      .create(ada, { name: 'Acme', slug: 'acme' });
    const member = Member.join({
      workspaceId: workspace.id,
      accountId: bob.accountId,
      email: bob.email,
    });
    await app.get(UnitOfWork).run(() => app.get(MemberRepository).save(member));
    const project = await app
      .get(ProjectsService)
      .create(ada, workspace.id, { name: 'Billing', slug: 'billing' });
    if (!bobRole.equals(ProjectRole.Viewer)) {
      await app
        .get(ProjectRolesService)
        .change(ada, workspace.id, project.id, member.id.value, {
          role: bobRole.value as 'contributor' | 'maintainer',
        });
    }
    const members = await app.get(MembersService).list(ada, workspace.id);

    return {
      workspaceId: workspace.id,
      projectId: project.id,
      ada,
      adaId: members.find(({ email }) => email === ada.email)?.id ?? '',
      bob,
      bobId: member.id.value,
    };
  }

  describe('record', () => {
    it('records a Draft, numbering each Kind on its own', async () => {
      // Arrange
      const { workspaceId, projectId, ada, adaId } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(
        ada,
        workspaceId,
        projectId,
        term('Invoice'),
      );
      await knowledgeService.record(ada, workspaceId, projectId, requirement);

      // Act
      const recorded = await knowledgeService.record(
        ada,
        workspaceId,
        projectId,
        term('Payment'),
      );

      // Assert
      expect(recorded).toEqual({
        id: expect.any(String),
        key: 'TERM-2',
        kind: 'term',
        title: 'Payment',
        status: 'draft',
        source: 'manual',
        rationale: null,
        fields: {
          definition: 'What Payment means',
          sort: null,
          synonymsToAvoid: [],
        },
        authorId: adaId,
        recordedAt: expect.any(String),
        lastEditedBy: null,
        lastEditedAt: null,
        approvedBy: null,
        approvedAt: null,
        rejectedBy: null,
        rejectedAt: null,
        rejectionReason: null,
        version: 1,
        access: {
          canEdit: true,
          canDelete: true,
          canApprove: true,
          canReject: true,
        },
      });
    });

    it('lets a Contributor record a Draft', async () => {
      // Arrange
      const { workspaceId, projectId, bob, bobId } = await setUp(
        ProjectRole.Contributor,
      );

      // Act
      const recorded = await app
        .get(KnowledgeService)
        .record(bob, workspaceId, projectId, requirement);

      // Assert
      expect(recorded).toMatchObject({
        key: 'REQ-1',
        rationale: 'Ada: "customers print reports"',
        authorId: bobId,
      });
    });

    it('forbids a Viewer and hands out no number', async () => {
      // Arrange
      const { workspaceId, projectId, ada, bob } = await setUp();

      // Act
      const recording = app
        .get(KnowledgeService)
        .record(bob, workspaceId, projectId, term('Invoice'));

      // Assert
      await expect(recording).rejects.toBeInstanceOf(
        KnowledgeRecordingForbiddenException,
      );
      const next = await app
        .get(KnowledgeService)
        .record(ada, workspaceId, projectId, term('Invoice'));
      expect(next.key).toBe('TERM-1');
    });

    it('reports an outsider as not finding the Workspace', async () => {
      // Arrange
      const { workspaceId, projectId } = await setUp();

      // Act
      const recording = app
        .get(KnowledgeService)
        .record(
          actor('eve@example.com'),
          workspaceId,
          projectId,
          term('Invoice'),
        );

      // Assert
      await expect(recording).rejects.toMatchObject({
        code: 'WORKSPACE_NOT_FOUND',
      });
    });

    it('reports an unknown Project as not found', async () => {
      // Arrange
      const { workspaceId, ada } = await setUp();

      // Act
      const recording = app
        .get(KnowledgeService)
        .record(ada, workspaceId, new ProjectId().value, term('Invoice'));

      // Assert
      await expect(recording).rejects.toMatchObject({
        code: 'PROJECT_NOT_FOUND',
      });
    });
  });

  describe('list', () => {
    it('pages through the knowledge sorted by Kind, then by number', async () => {
      // Arrange
      const { workspaceId, projectId, ada, bob } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      for (const data of [
        term('A'),
        term('B'),
        requirement,
        decision,
        term('C'),
      ]) {
        await knowledgeService.record(ada, workspaceId, projectId, data);
      }

      // Act
      const page = await knowledgeService.list(bob, workspaceId, projectId, {
        take: 2,
        offset: 1,
      });

      // Assert
      expect(page.total).toBe(5);
      expect(page.items.map(({ key }) => key)).toEqual(['REQ-1', 'TERM-1']);
    });

    it('filters by Kind and counts only what matches', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      for (const data of [term('A'), requirement, term('B')]) {
        await knowledgeService.record(ada, workspaceId, projectId, data);
      }

      // Act
      const page = await knowledgeService.list(ada, workspaceId, projectId, {
        kind: 'term',
        status: 'draft',
        ...firstPage,
      });

      // Assert
      expect(page.total).toBe(2);
      expect(page.items.map(({ key }) => key)).toEqual(['TERM-1', 'TERM-2']);
    });
  });

  describe('get', () => {
    it('reads a Knowledge Item by its Knowledge Key', async () => {
      // Arrange
      const { workspaceId, projectId, ada, bob } = await setUp();
      const recorded = await app
        .get(KnowledgeService)
        .record(ada, workspaceId, projectId, decision);

      // Act
      const item = await app
        .get(KnowledgeService)
        .get(bob, workspaceId, projectId, 'DEC-1');

      // Assert
      expect(item).toEqual({
        ...recorded,
        access: {
          canEdit: false,
          canDelete: false,
          canApprove: false,
          canReject: false,
        },
      });
    });

    it('reports an unknown Knowledge Key as not found', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();

      // Act
      const reading = app
        .get(KnowledgeService)
        .get(ada, workspaceId, projectId, 'REQ-7');

      // Assert
      await expect(reading).rejects.toBeInstanceOf(
        KnowledgeItemNotFoundException,
      );
    });
  });

  describe('edit', () => {
    it("lets a Contributor edit another Member's Draft", async () => {
      // Arrange
      const { workspaceId, projectId, ada, adaId, bob, bobId } = await setUp(
        ProjectRole.Contributor,
      );
      await app
        .get(KnowledgeService)
        .record(ada, workspaceId, projectId, requirement);

      // Act
      const edited = await app
        .get(KnowledgeService)
        .edit(bob, workspaceId, projectId, 'REQ-1', {
          kind: 'requirement',
          version: 1,
          rationale: null,
          fields: {
            statement: 'Export a report to PDF and CSV',
            type: 'functional',
            priority: 'should',
            acceptanceCriteria: [],
          },
        });

      // Assert
      expect(edited).toMatchObject({
        key: 'REQ-1',
        title: 'PDF export',
        rationale: null,
        fields: {
          statement: 'Export a report to PDF and CSV',
          priority: 'should',
        },
        authorId: adaId,
        lastEditedBy: bobId,
        lastEditedAt: expect.any(String),
        version: 2,
        access: { canEdit: true, canApprove: false },
      });
      const item = await app
        .get(KnowledgeService)
        .get(bob, workspaceId, projectId, 'REQ-1');
      expect(item).toEqual(edited);
    });

    it('refuses a change made on an older version, losing no edit', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(ada, workspaceId, projectId, requirement);
      await knowledgeService.edit(ada, workspaceId, projectId, 'REQ-1', {
        kind: 'requirement',
        version: 1,
        title: 'Report export',
      });

      // Act
      const editing = knowledgeService.edit(
        ada,
        workspaceId,
        projectId,
        'REQ-1',
        {
          kind: 'requirement',
          version: 1,
          title: 'PDF and CSV export',
        },
      );

      // Assert
      await expect(editing).rejects.toBeInstanceOf(
        KnowledgeItemChangedException,
      );
      const item = await knowledgeService.get(
        ada,
        workspaceId,
        projectId,
        'REQ-1',
      );
      expect(item.title).toBe('Report export');
    });

    it('refuses another Kind', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      await app
        .get(KnowledgeService)
        .record(ada, workspaceId, projectId, requirement);

      // Act
      const editing = app
        .get(KnowledgeService)
        .edit(ada, workspaceId, projectId, 'REQ-1', {
          kind: 'term',
          version: 1,
          title: 'Export',
        });

      // Assert
      await expect(editing).rejects.toBeInstanceOf(
        KnowledgeKindMismatchException,
      );
    });

    it('forbids a Viewer', async () => {
      // Arrange
      const { workspaceId, projectId, ada, bob } = await setUp();
      await app
        .get(KnowledgeService)
        .record(ada, workspaceId, projectId, requirement);

      // Act
      const editing = app
        .get(KnowledgeService)
        .edit(bob, workspaceId, projectId, 'REQ-1', {
          kind: 'requirement',
          version: 1,
          title: 'Export',
        });

      // Assert
      await expect(editing).rejects.toBeInstanceOf(
        DraftEditingForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('deletes a Draft and never reuses its Knowledge Key', async () => {
      // Arrange
      const { workspaceId, projectId, ada, bob } = await setUp(
        ProjectRole.Contributor,
      );
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(
        ada,
        workspaceId,
        projectId,
        term('Invoice'),
      );

      // Act
      await knowledgeService.delete(bob, workspaceId, projectId, 'TERM-1', {
        version: 1,
      });

      // Assert
      const reading = knowledgeService.get(
        ada,
        workspaceId,
        projectId,
        'TERM-1',
      );
      await expect(reading).rejects.toBeInstanceOf(
        KnowledgeItemNotFoundException,
      );
      const next = await knowledgeService.record(
        ada,
        workspaceId,
        projectId,
        term('Invoice'),
      );
      expect(next.key).toBe('TERM-2');
    });

    it('forbids a Viewer', async () => {
      // Arrange
      const { workspaceId, projectId, ada, bob } = await setUp();
      await app
        .get(KnowledgeService)
        .record(ada, workspaceId, projectId, term('Invoice'));

      // Act
      const deleting = app
        .get(KnowledgeService)
        .delete(bob, workspaceId, projectId, 'TERM-1', { version: 1 });

      // Assert
      await expect(deleting).rejects.toBeInstanceOf(
        DraftDeletionForbiddenException,
      );
    });
  });

  describe('approve', () => {
    it('lets a Maintainer approve a Draft on the version they saw', async () => {
      // Arrange
      const { workspaceId, projectId, ada, adaId } = await setUp();
      await app
        .get(KnowledgeService)
        .record(ada, workspaceId, projectId, requirement);

      // Act
      const approved = await app
        .get(KnowledgeService)
        .approve(ada, workspaceId, projectId, 'REQ-1', { version: 1 });

      // Assert
      expect(approved).toMatchObject({
        status: 'approved',
        approvedBy: adaId,
        approvedAt: expect.any(String),
        version: 2,
        access: {
          canEdit: false,
          canDelete: false,
          canApprove: false,
          canReject: false,
        },
      });
    });

    it('refuses to approve a Draft edited since it was read', async () => {
      // Arrange
      const { workspaceId, projectId, ada, bob } = await setUp(
        ProjectRole.Contributor,
      );
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(ada, workspaceId, projectId, requirement);
      await knowledgeService.edit(bob, workspaceId, projectId, 'REQ-1', {
        kind: 'requirement',
        version: 1,
        title: 'PDF and Excel export',
      });

      // Act
      const approving = knowledgeService.approve(
        ada,
        workspaceId,
        projectId,
        'REQ-1',
        { version: 1 },
      );

      // Assert
      await expect(approving).rejects.toBeInstanceOf(
        KnowledgeItemChangedException,
      );
    });

    it('forbids a Contributor', async () => {
      // Arrange
      const { workspaceId, projectId, bob } = await setUp(
        ProjectRole.Contributor,
      );
      await app
        .get(KnowledgeService)
        .record(bob, workspaceId, projectId, requirement);

      // Act
      const approving = app
        .get(KnowledgeService)
        .approve(bob, workspaceId, projectId, 'REQ-1', { version: 1 });

      // Assert
      await expect(approving).rejects.toBeInstanceOf(
        DraftApprovalForbiddenException,
      );
    });

    it('never edits or deletes an Approved item', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(ada, workspaceId, projectId, requirement);
      await knowledgeService.approve(ada, workspaceId, projectId, 'REQ-1', {
        version: 1,
      });

      // Act
      const editing = knowledgeService.edit(
        ada,
        workspaceId,
        projectId,
        'REQ-1',
        { kind: 'requirement', version: 2, title: 'Export' },
      );
      const deleting = knowledgeService.delete(
        ada,
        workspaceId,
        projectId,
        'REQ-1',
        { version: 2 },
      );

      // Assert
      await expect(editing).rejects.toBeInstanceOf(
        KnowledgeItemNotDraftException,
      );
      await expect(deleting).rejects.toBeInstanceOf(
        KnowledgeItemNotDraftException,
      );
    });
  });

  describe('reject', () => {
    it('keeps a Rejected item out of the list unless asked for', async () => {
      // Arrange
      const { workspaceId, projectId, ada, adaId } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(ada, workspaceId, projectId, requirement);
      await knowledgeService.record(ada, workspaceId, projectId, decision);

      // Act
      const rejected = await knowledgeService.reject(
        ada,
        workspaceId,
        projectId,
        'REQ-1',
        { version: 1, reason: 'Customers never print' },
      );

      // Assert
      expect(rejected).toMatchObject({
        status: 'rejected',
        rejectedBy: adaId,
        rejectedAt: expect.any(String),
        rejectionReason: 'Customers never print',
      });
      const listed = await knowledgeService.list(
        ada,
        workspaceId,
        projectId,
        firstPage,
      );
      expect(listed.items.map(({ key }) => key)).toEqual(['DEC-1']);
      const asked = await knowledgeService.list(ada, workspaceId, projectId, {
        status: 'rejected',
        ...firstPage,
      });
      expect(asked.items.map(({ key }) => key)).toEqual(['REQ-1']);
      const read = await knowledgeService.get(
        ada,
        workspaceId,
        projectId,
        'REQ-1',
      );
      expect(read).toEqual(rejected);
    });
  });

  describe('access', () => {
    it.each([
      [ProjectRole.Viewer, []],
      [ProjectRole.Contributor, ['term', 'requirement', 'decision']],
    ])('tells a %o which Kinds they may record', async (bobRole, kinds) => {
      // Arrange
      const { workspaceId, projectId, bob } = await setUp(bobRole);

      // Act
      const page = await app
        .get(KnowledgeService)
        .list(bob, workspaceId, projectId, firstPage);

      // Assert
      expect(page.access.canRecord).toEqual(kinds);
    });
  });

  describe('cleanup', () => {
    async function nextNumber(workspaceId: string, projectId: string) {
      return app.get(UnitOfWork).run(() =>
        app.get(KnowledgeKeyCounter).next({
          workspaceId: new WorkspaceId(workspaceId),
          projectId: new ProjectId(projectId),
          kind: KnowledgeKind.Term,
        }),
      );
    }

    it('keeps the knowledge of a Member who leaves', async () => {
      // Arrange
      const { workspaceId, projectId, ada, bob } = await setUp(
        ProjectRole.Contributor,
      );
      await app
        .get(KnowledgeService)
        .record(bob, workspaceId, projectId, term('Invoice'));

      // Act
      await app.get(MembersService).leave(bob, workspaceId);

      // Assert
      const page = await app
        .get(KnowledgeService)
        .list(ada, workspaceId, projectId, firstPage);
      expect(page.total).toBe(1);
    });

    it('deletes the knowledge and its numbering with its Project', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      await app
        .get(KnowledgeService)
        .record(ada, workspaceId, projectId, term('Invoice'));

      // Act
      await app
        .get(ProjectsService)
        .delete(ada, workspaceId, projectId, { slug: 'billing' });

      // Assert
      const left = await app
        .get(KnowledgeItemRepository)
        .count({ projectId: new ProjectId(projectId) });
      expect(left).toBe(0);
      expect(await nextNumber(workspaceId, projectId)).toBe(1);
    });

    it('deletes the knowledge and its numbering with its Workspace', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      await app
        .get(KnowledgeService)
        .record(ada, workspaceId, projectId, term('Invoice'));

      // Act
      await app
        .get(WorkspacesService)
        .delete(ada, workspaceId, { slug: 'acme' });

      // Assert
      const left = await app
        .get(KnowledgeItemRepository)
        .count({ projectId: new ProjectId(projectId) });
      expect(left).toBe(0);
      expect(await nextNumber(workspaceId, projectId)).toBe(1);
    });
  });
});
