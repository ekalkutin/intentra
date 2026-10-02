import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import {
  AgentKindDtoSchema,
  intentraCaller,
  KnowledgeKindDtoSchema,
  ProjectRoleDtoSchema,
  type CallerDto,
  type ProjectRoleDto,
  type RecordKnowledgeItemDto,
} from '@intentra/contracts/workspace';
import { TestingApp } from '@intentra/platform-testing';
import { ProjectId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import { givenAccount } from '../../../../testing/account.fixtures.js';
import { givenOpenWorkspaceCreation } from '../../../../testing/workspace-creation.fixtures.js';
import { WorkspaceModule } from '../../../../workspace.module.js';
import {
  IntentraCallerForbiddenException,
  Member,
  MemberRepository,
  MembersService,
  ProjectNotFoundException,
  ProjectRole,
  ProjectRolesService,
  ProjectsService,
  WorkspacesService,
} from '../../../tenancy/index.js';
import {
  DraftApprovalForbiddenException,
  DraftDeletionForbiddenException,
  DraftEditingForbiddenException,
  IntentraRecordingForbiddenException,
  KnowledgeItemChangedException,
  KnowledgeItemNotApprovedException,
  KnowledgeItemNotDraftException,
  KnowledgeKindMismatchException,
  KnowledgeRecordingForbiddenException,
  KnowledgeRetirementForbiddenException,
  ProductOverviewAlreadyApprovedException,
  RationaleRequiredException,
  SupersededItemNotApprovedException,
} from '../../domain/exceptions/index.js';
import { KnowledgeKind } from '../../domain/value-objects/index.js';
import { KnowledgeItemNotFoundException } from '../exceptions/index.js';
import {
  KnowledgeItemRepository,
  KnowledgeKeyCounter,
} from '../ports/outbound/index.js';

import { KnowledgeService } from './knowledge.service.js';

function person(actor: Actor): CallerDto {
  return { actor, agent: null };
}

function agentOf(actor: Actor, level: ProjectRoleDto): CallerDto {
  return {
    actor,
    agent: { kind: AgentKindDtoSchema.enum.external, level, projectId: null },
  };
}

/** Intentra's own Agent in a Conversation: at most a Contributor, in the Conversation's Project only. */
function intentraAgentOf(actor: Actor, projectId: string): CallerDto {
  return {
    actor,
    agent: {
      kind: AgentKindDtoSchema.enum.intentra,
      level: ProjectRoleDtoSchema.enum.contributor,
      projectId,
    },
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

const requirement: RecordKnowledgeItemDto = {
  kind: 'requirement',
  title: 'PDF export',
  rationale: 'Ada: "customers print reports"',
  supersedes: null,
  links: [],
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
  supersedes: null,
  links: [],
  fields: {
    decision: 'Store data in MongoDB',
    area: 'architecture',
    context: null,
    rejectedAlternatives: [{ alternative: 'PostgreSQL', reason: null }],
  },
};

const productOverview = (summary: string): RecordKnowledgeItemDto => ({
  kind: 'product-overview',
  title: 'Intentra',
  rationale: null,
  supersedes: null,
  links: [],
  fields: { summary, problem: null, audience: null, value: null },
});

const firstPage = { take: 50, offset: 0 };

describe('KnowledgeService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  beforeEach(() => givenOpenWorkspaceCreation(app));

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
    const ada = await givenAccount(app, 'ada@example.com');
    const bob = await givenAccount(app, 'bob@example.com');
    const workspace = await app
      .get(WorkspacesService)
      .create(ada, { name: 'Acme', slug: 'acme' });
    const member = Member.join({
      workspaceId: workspace.id,
      accountId: bob.accountId,
      email: bob.email,
      name: bob.name,
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
        person(ada),
        workspaceId,
        projectId,
        term('Invoice'),
      );
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        requirement,
      );

      // Act
      const recorded = await knowledgeService.record(
        person(ada),
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
        mainField: 'What Payment means',
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
        supersedes: null,
        supersededBy: null,
        supersededAt: null,
        supersededByKey: null,
        retiredBy: null,
        retiredAt: null,
        retirementReason: null,
        links: [],
        answeredBy: [],
        needsReview: false,
        reviewCauses: [],
        dependencyNeedsReview: null,
        version: 1,
        access: {
          canEdit: true,
          canDelete: true,
          canApprove: true,
          canReject: true,
          canRecordReplacement: false,
          canRetire: false,
          canConfirm: false,
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
        .record(person(bob), workspaceId, projectId, requirement);

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
        .record(person(bob), workspaceId, projectId, term('Invoice'));

      // Assert
      await expect(recording).rejects.toBeInstanceOf(
        KnowledgeRecordingForbiddenException,
      );
      const next = await app
        .get(KnowledgeService)
        .record(person(ada), workspaceId, projectId, term('Invoice'));
      expect(next.key).toBe('TERM-1');
    });

    it('reports an outsider as not finding the Workspace', async () => {
      // Arrange
      const { workspaceId, projectId } = await setUp();

      // Act
      const recording = app
        .get(KnowledgeService)
        .record(
          person(await givenAccount(app, 'eve@example.com')),
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
        .record(
          person(ada),
          workspaceId,
          new ProjectId().value,
          term('Invoice'),
        );

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
        await knowledgeService.record(
          person(ada),
          workspaceId,
          projectId,
          data,
        );
      }

      // Act
      const page = await knowledgeService.list(
        person(bob),
        workspaceId,
        projectId,
        {
          take: 2,
          offset: 1,
        },
      );

      // Assert
      expect(page.total).toBe(5);
      expect(page.items.map(({ key }) => key)).toEqual(['REQ-1', 'TERM-1']);
    });

    it('filters by Kind and counts only what matches', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      for (const data of [term('A'), requirement, term('B')]) {
        await knowledgeService.record(
          person(ada),
          workspaceId,
          projectId,
          data,
        );
      }

      // Act
      const page = await knowledgeService.list(
        person(ada),
        workspaceId,
        projectId,
        {
          kind: 'term',
          statuses: ['draft'],
          ...firstPage,
        },
      );

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
        .record(person(ada), workspaceId, projectId, decision);

      // Act
      const item = await app
        .get(KnowledgeService)
        .get(person(bob), workspaceId, projectId, 'DEC-1');

      // Assert
      expect(item).toEqual({
        ...recorded,
        dependencyNeedsReview: false,
        access: {
          canEdit: false,
          canDelete: false,
          canApprove: false,
          canReject: false,
          canRecordReplacement: false,
          canRetire: false,
          canConfirm: false,
        },
      });
    });

    it('reports an unknown Knowledge Key as not found', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();

      // Act
      const reading = app
        .get(KnowledgeService)
        .get(person(ada), workspaceId, projectId, 'REQ-7');

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
        .record(person(ada), workspaceId, projectId, requirement);

      // Act
      const edited = await app
        .get(KnowledgeService)
        .edit(person(bob), workspaceId, projectId, 'REQ-1', {
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
        .get(person(bob), workspaceId, projectId, 'REQ-1');
      expect(item).toEqual({ ...edited, dependencyNeedsReview: false });
    });

    it('refuses a change made on an older version, losing no edit', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        requirement,
      );
      await knowledgeService.edit(
        person(ada),
        workspaceId,
        projectId,
        'REQ-1',
        {
          kind: 'requirement',
          version: 1,
          title: 'Report export',
        },
      );

      // Act
      const editing = knowledgeService.edit(
        person(ada),
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
        person(ada),
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
        .record(person(ada), workspaceId, projectId, requirement);

      // Act
      const editing = app
        .get(KnowledgeService)
        .edit(person(ada), workspaceId, projectId, 'REQ-1', {
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
        .record(person(ada), workspaceId, projectId, requirement);

      // Act
      const editing = app
        .get(KnowledgeService)
        .edit(person(bob), workspaceId, projectId, 'REQ-1', {
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
        person(ada),
        workspaceId,
        projectId,
        term('Invoice'),
      );

      // Act
      await knowledgeService.delete(
        person(bob),
        workspaceId,
        projectId,
        'TERM-1',
        {
          version: 1,
        },
      );

      // Assert
      const reading = knowledgeService.get(
        person(ada),
        workspaceId,
        projectId,
        'TERM-1',
      );
      await expect(reading).rejects.toBeInstanceOf(
        KnowledgeItemNotFoundException,
      );
      const next = await knowledgeService.record(
        person(ada),
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
        .record(person(ada), workspaceId, projectId, term('Invoice'));

      // Act
      const deleting = app
        .get(KnowledgeService)
        .delete(person(bob), workspaceId, projectId, 'TERM-1', { version: 1 });

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
        .record(person(ada), workspaceId, projectId, requirement);

      // Act
      const approved = await app
        .get(KnowledgeService)
        .approve(person(ada), workspaceId, projectId, 'REQ-1', { version: 1 });

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
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        requirement,
      );
      await knowledgeService.edit(
        person(bob),
        workspaceId,
        projectId,
        'REQ-1',
        {
          kind: 'requirement',
          version: 1,
          title: 'PDF and Excel export',
        },
      );

      // Act
      const approving = knowledgeService.approve(
        person(ada),
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
        .record(person(bob), workspaceId, projectId, requirement);

      // Act
      const approving = app
        .get(KnowledgeService)
        .approve(person(bob), workspaceId, projectId, 'REQ-1', { version: 1 });

      // Assert
      await expect(approving).rejects.toBeInstanceOf(
        DraftApprovalForbiddenException,
      );
    });

    it('never edits or deletes an Approved item', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        requirement,
      );
      await knowledgeService.approve(
        person(ada),
        workspaceId,
        projectId,
        'REQ-1',
        {
          version: 1,
        },
      );

      // Act
      const [editing, deleting] = await Promise.allSettled([
        knowledgeService.edit(person(ada), workspaceId, projectId, 'REQ-1', {
          kind: 'requirement',
          version: 2,
          title: 'Export',
        }),
        knowledgeService.delete(person(ada), workspaceId, projectId, 'REQ-1', {
          version: 2,
        }),
      ]);

      // Assert
      for (const outcome of [editing, deleting]) {
        expect(outcome).toMatchObject({
          status: 'rejected',
          reason: expect.any(KnowledgeItemNotDraftException),
        });
      }
    });
  });

  describe('reject', () => {
    it('keeps a Rejected item out of the list unless asked for', async () => {
      // Arrange
      const { workspaceId, projectId, ada, adaId } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        requirement,
      );
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        decision,
      );

      // Act
      const rejected = await knowledgeService.reject(
        person(ada),
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
        person(ada),
        workspaceId,
        projectId,
        firstPage,
      );
      expect(listed.items.map(({ key }) => key)).toEqual(['DEC-1']);
      const asked = await knowledgeService.list(
        person(ada),
        workspaceId,
        projectId,
        {
          statuses: ['rejected'],
          ...firstPage,
        },
      );
      expect(asked.items.map(({ key }) => key)).toEqual(['REQ-1']);
      const read = await knowledgeService.get(
        person(ada),
        workspaceId,
        projectId,
        'REQ-1',
      );
      expect(read).toEqual({ ...rejected, dependencyNeedsReview: false });
    });
  });

  describe('supersede', () => {
    /** Ada records and approves REQ-1. */
    async function approveRequirement(setup: Setup) {
      const knowledgeService = app.get(KnowledgeService);
      const ada = person(setup.ada);
      await knowledgeService.record(
        ada,
        setup.workspaceId,
        setup.projectId,
        requirement,
      );
      await knowledgeService.approve(
        ada,
        setup.workspaceId,
        setup.projectId,
        'REQ-1',
        { version: 1 },
      );
    }

    function replacement(statement: string): RecordKnowledgeItemDto {
      return {
        kind: 'requirement',
        title: 'Report export',
        rationale: null,
        supersedes: 'REQ-1',
        links: [],
        fields: {
          statement,
          type: 'functional',
          priority: 'must',
          acceptanceCriteria: [],
        },
      };
    }

    it("replaces an Approved item once a Contributor's replacement is approved", async () => {
      // Arrange
      const setup = await setUp(ProjectRole.Contributor);
      const { workspaceId, projectId, ada, adaId, bob } = setup;
      const knowledgeService = app.get(KnowledgeService);
      await approveRequirement(setup);
      const approved = await knowledgeService.get(
        person(bob),
        workspaceId,
        projectId,
        'REQ-1',
      );
      await knowledgeService.record(
        person(bob),
        workspaceId,
        projectId,
        replacement('Export a report to PDF and CSV'),
      );

      // Act
      const replacing = await knowledgeService.approve(
        person(ada),
        workspaceId,
        projectId,
        'REQ-2',
        { version: 1 },
      );

      // Assert
      expect(approved.access).toMatchObject({
        canRecordReplacement: true,
        canRetire: false,
      });
      expect(replacing).toMatchObject({
        status: 'approved',
        supersedes: 'REQ-1',
      });
      const replaced = await knowledgeService.get(
        person(ada),
        workspaceId,
        projectId,
        'REQ-1',
      );
      expect(replaced).toMatchObject({
        status: 'obsolete',
        supersededBy: adaId,
        supersededAt: expect.any(String),
        supersededByKey: 'REQ-2',
        version: 3,
        access: { canRecordReplacement: false, canRetire: false },
      });
      const listed = await knowledgeService.list(
        person(ada),
        workspaceId,
        projectId,
        firstPage,
      );
      expect(listed.items.map(({ key }) => key)).toEqual(['REQ-2']);
      const obsolete = await knowledgeService.list(
        person(ada),
        workspaceId,
        projectId,
        { statuses: ['obsolete'], ...firstPage },
      );
      expect(obsolete.items.map(({ key }) => key)).toEqual(['REQ-1']);
    });

    it('refuses a second replacement of an item already replaced', async () => {
      // Arrange
      const setup = await setUp();
      const { workspaceId, projectId, ada } = setup;
      const knowledgeService = app.get(KnowledgeService);
      await approveRequirement(setup);
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        replacement('Export a report to PDF and CSV'),
      );
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        replacement('Export a report to PDF and Excel'),
      );
      await knowledgeService.approve(
        person(ada),
        workspaceId,
        projectId,
        'REQ-2',
        { version: 1 },
      );

      // Act
      const approving = knowledgeService.approve(
        person(ada),
        workspaceId,
        projectId,
        'REQ-3',
        { version: 1 },
      );

      // Assert
      await expect(approving).rejects.toBeInstanceOf(
        SupersededItemNotApprovedException,
      );
    });

    it('refuses to record a replacement of a Draft or of another Kind', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      const caller = person(ada);
      await knowledgeService.record(
        caller,
        workspaceId,
        projectId,
        requirement,
      );
      await knowledgeService.record(
        caller,
        workspaceId,
        projectId,
        term('Invoice'),
      );
      await knowledgeService.approve(caller, workspaceId, projectId, 'TERM-1', {
        version: 1,
      });

      // Act
      const [ofDraft, ofTerm] = await Promise.allSettled([
        knowledgeService.record(
          caller,
          workspaceId,
          projectId,
          replacement('Export a report to PDF and CSV'),
        ),
        knowledgeService.record(caller, workspaceId, projectId, {
          ...replacement('Export a report to PDF and CSV'),
          supersedes: 'TERM-1',
        }),
      ]);

      // Assert
      expect(ofDraft).toMatchObject({
        status: 'rejected',
        reason: expect.any(SupersededItemNotApprovedException),
      });
      expect(ofTerm).toMatchObject({
        status: 'rejected',
        reason: expect.any(KnowledgeKindMismatchException),
      });
    });
  });

  describe('product overview', () => {
    /** Ada approves PO-1. */
    async function approveProductOverview(setup: Setup) {
      const knowledgeService = app.get(KnowledgeService);
      const caller = person(setup.ada);
      await knowledgeService.record(
        caller,
        setup.workspaceId,
        setup.projectId,
        productOverview('A tool for invoices'),
      );
      await knowledgeService.approve(
        caller,
        setup.workspaceId,
        setup.projectId,
        'PO-1',
        { version: 1 },
      );
    }

    it('refuses a second Approved one beside the first', async () => {
      // Arrange
      const setup = await setUp();
      const { workspaceId, projectId, ada } = setup;
      await approveProductOverview(setup);
      await app
        .get(KnowledgeService)
        .record(
          person(ada),
          workspaceId,
          projectId,
          productOverview('A tool for invoices and payments'),
        );

      // Act
      const approving = app
        .get(KnowledgeService)
        .approve(person(ada), workspaceId, projectId, 'PO-2', { version: 1 });

      // Assert
      await expect(approving).rejects.toBeInstanceOf(
        ProductOverviewAlreadyApprovedException,
      );
    });

    it('changes only by Supersession', async () => {
      // Arrange
      const setup = await setUp();
      const { workspaceId, projectId, ada } = setup;
      const knowledgeService = app.get(KnowledgeService);
      await approveProductOverview(setup);
      await knowledgeService.record(person(ada), workspaceId, projectId, {
        ...productOverview('A tool for invoices and payments'),
        supersedes: 'PO-1',
      });

      // Act
      await knowledgeService.approve(
        person(ada),
        workspaceId,
        projectId,
        'PO-2',
        {
          version: 1,
        },
      );

      // Assert
      const page = await knowledgeService.list(
        person(ada),
        workspaceId,
        projectId,
        { kind: 'product-overview', statuses: ['approved'], ...firstPage },
      );
      expect(page.items.map(({ key }) => key)).toEqual(['PO-2']);
    });
  });

  describe('retire', () => {
    it('lets a Maintainer retire an Approved item with a reason', async () => {
      // Arrange
      const { workspaceId, projectId, ada, adaId } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        requirement,
      );
      await knowledgeService.approve(
        person(ada),
        workspaceId,
        projectId,
        'REQ-1',
        { version: 1 },
      );

      // Act
      const retired = await knowledgeService.retire(
        person(ada),
        workspaceId,
        projectId,
        'REQ-1',
        { version: 2, reason: 'Printing was dropped' },
      );

      // Assert
      expect(retired).toMatchObject({
        status: 'obsolete',
        retiredBy: adaId,
        retiredAt: expect.any(String),
        retirementReason: 'Printing was dropped',
        version: 3,
      });
    });

    it('forbids a Contributor and refuses a Draft', async () => {
      // Arrange
      const { workspaceId, projectId, ada, bob } = await setUp(
        ProjectRole.Contributor,
      );
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        requirement,
      );

      // Act
      const [byContributor, ofDraft] = await Promise.allSettled([
        knowledgeService.retire(person(bob), workspaceId, projectId, 'REQ-1', {
          version: 1,
          reason: null,
        }),
        knowledgeService.retire(person(ada), workspaceId, projectId, 'REQ-1', {
          version: 1,
          reason: null,
        }),
      ]);

      // Assert
      expect(byContributor).toMatchObject({
        status: 'rejected',
        reason: expect.any(KnowledgeRetirementForbiddenException),
      });
      expect(ofDraft).toMatchObject({
        status: 'rejected',
        reason: expect.any(KnowledgeItemNotApprovedException),
      });
    });
  });

  describe('through an external agent', () => {
    it('records a Draft with its Source and rationale', async () => {
      // Arrange
      const { workspaceId, projectId, ada, adaId } = await setUp();

      // Act
      const recorded = await app
        .get(KnowledgeService)
        .record(
          agentOf(ada, 'maintainer'),
          workspaceId,
          projectId,
          requirement,
        );

      // Assert
      expect(recorded).toMatchObject({
        source: 'external-agent',
        rationale: 'Ada: "customers print reports"',
        authorId: adaId,
      });
    });

    it('refuses to record without a rationale, or to clear it', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      const agent = agentOf(ada, 'maintainer');
      await knowledgeService.record(agent, workspaceId, projectId, requirement);

      // Act
      const [recording, clearing] = await Promise.allSettled([
        knowledgeService.record(agent, workspaceId, projectId, term('Invoice')),
        knowledgeService.edit(person(ada), workspaceId, projectId, 'REQ-1', {
          kind: 'requirement',
          version: 1,
          rationale: null,
        }),
      ]);

      // Assert
      for (const outcome of [recording, clearing]) {
        expect(outcome).toMatchObject({
          status: 'rejected',
          reason: expect.any(RationaleRequiredException),
        });
      }
    });

    it("keeps the agent to the lower of its token's level and the Project Role", async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        requirement,
      );

      // Act
      const [recording, approving] = await Promise.allSettled([
        knowledgeService.record(
          agentOf(ada, 'viewer'),
          workspaceId,
          projectId,
          requirement,
        ),
        knowledgeService.approve(
          agentOf(ada, 'contributor'),
          workspaceId,
          projectId,
          'REQ-1',
          { version: 1 },
        ),
      ]);

      // Assert
      expect(recording).toMatchObject({
        status: 'rejected',
        reason: expect.any(KnowledgeRecordingForbiddenException),
      });
      expect(approving).toMatchObject({
        status: 'rejected',
        reason: expect.any(DraftApprovalForbiddenException),
      });
      const page = await knowledgeService.list(
        agentOf(ada, 'contributor'),
        workspaceId,
        projectId,
        firstPage,
      );
      expect(page.items[0]?.access).toMatchObject({
        canEdit: true,
        canApprove: false,
      });
    });

    it('never gets more than the Project Role, whatever the token', async () => {
      // Arrange
      const { workspaceId, projectId, bob } = await setUp();

      // Act
      const recording = app
        .get(KnowledgeService)
        .record(
          agentOf(bob, 'maintainer'),
          workspaceId,
          projectId,
          requirement,
        );

      // Assert
      await expect(recording).rejects.toBeInstanceOf(
        KnowledgeRecordingForbiddenException,
      );
    });
  });

  describe("through Intentra's own agent", () => {
    it('records a Draft with its Source and rationale', async () => {
      // Arrange
      const { workspaceId, projectId, ada, adaId } = await setUp();

      // Act
      const recorded = await app
        .get(KnowledgeService)
        .record(
          intentraAgentOf(ada, projectId),
          workspaceId,
          projectId,
          requirement,
        );

      // Assert
      expect(recorded).toMatchObject({
        source: 'intentra-agent',
        rationale: 'Ada: "customers print reports"',
        authorId: adaId,
      });
    });

    it('reaches no Project but its own, whatever the Project Role', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const payroll = await app
        .get(ProjectsService)
        .create(ada, workspaceId, { name: 'Payroll', slug: 'payroll' });
      const knowledgeService = app.get(KnowledgeService);
      const agent = intentraAgentOf(ada, projectId);

      // Act
      const [recording, listing] = await Promise.allSettled([
        knowledgeService.record(agent, workspaceId, payroll.id, requirement),
        knowledgeService.list(agent, workspaceId, payroll.id, firstPage),
      ]);

      // Assert
      for (const outcome of [recording, listing]) {
        expect(outcome).toMatchObject({
          status: 'rejected',
          reason: expect.any(ProjectNotFoundException),
        });
      }
    });

    it('works as a Contributor for a Maintainer', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      const agent = intentraAgentOf(ada, projectId);
      await knowledgeService.record(agent, workspaceId, projectId, requirement);

      // Act
      const approving = knowledgeService.approve(
        agent,
        workspaceId,
        projectId,
        'REQ-1',
        { version: 1 },
      );

      // Assert
      await expect(approving).rejects.toBeInstanceOf(
        DraftApprovalForbiddenException,
      );
    });
  });

  describe('through Intentra itself, in an Analysis Run', () => {
    const question: RecordKnowledgeItemDto = {
      kind: 'open-question',
      title: 'Export format',
      rationale: 'REQ-1 says PDF, BR-1 says CSV',
      supersedes: null,
      links: [],
      fields: { question: 'Which format does an export use?' },
    };

    it('reads the knowledge of its Project and records an Open Question as Intentra', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        requirement,
      );
      const intentra = intentraCaller(projectId);

      // Act
      const page = await knowledgeService.list(
        intentra,
        workspaceId,
        projectId,
        { ...firstPage, statuses: ['draft'] },
      );
      const recorded = await knowledgeService.record(
        intentra,
        workspaceId,
        projectId,
        question,
      );

      // Assert
      expect(page.items.map(item => item.key)).toEqual(['REQ-1']);
      expect(recorded).toMatchObject({
        key: 'TBD-1',
        source: 'analysis-run',
        authorId: null,
        rationale: 'REQ-1 says PDF, BR-1 says CSV',
      });
    });

    it('records no other Kind and no replacement', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        question,
      );
      await knowledgeService.approve(
        person(ada),
        workspaceId,
        projectId,
        'TBD-1',
        {
          version: 1,
        },
      );
      const intentra = intentraCaller(projectId);

      // Act
      const outcomes = await Promise.allSettled([
        knowledgeService.record(intentra, workspaceId, projectId, requirement),
        knowledgeService.record(intentra, workspaceId, projectId, {
          ...question,
          supersedes: 'TBD-1',
        }),
      ]);

      // Assert
      for (const outcome of outcomes) {
        expect(outcome).toMatchObject({
          status: 'rejected',
          reason: expect.any(IntentraRecordingForbiddenException),
        });
      }
    });

    it('changes nothing else', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const knowledgeService = app.get(KnowledgeService);
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        requirement,
      );
      await knowledgeService.record(
        person(ada),
        workspaceId,
        projectId,
        decision,
      );
      await knowledgeService.approve(
        person(ada),
        workspaceId,
        projectId,
        'DEC-1',
        {
          version: 1,
        },
      );
      const intentra = intentraCaller(projectId);
      const seen = { version: 1 };

      // Act
      const outcomes = await Promise.allSettled([
        knowledgeService.edit(intentra, workspaceId, projectId, 'REQ-1', {
          kind: 'requirement',
          version: 1,
          title: 'Changed',
        }),
        knowledgeService.delete(
          intentra,
          workspaceId,
          projectId,
          'REQ-1',
          seen,
        ),
        knowledgeService.approve(
          intentra,
          workspaceId,
          projectId,
          'REQ-1',
          seen,
        ),
        knowledgeService.approveTogether(intentra, workspaceId, projectId, {
          items: [{ key: 'REQ-1', version: 1 }],
        }),
        knowledgeService.reject(intentra, workspaceId, projectId, 'REQ-1', {
          ...seen,
          reason: 'Wrong',
        }),
        knowledgeService.retire(intentra, workspaceId, projectId, 'DEC-1', {
          version: 2,
          reason: 'Dropped',
        }),
        knowledgeService.confirm(
          intentra,
          workspaceId,
          projectId,
          'REQ-1',
          seen,
        ),
      ]);

      // Assert
      for (const outcome of outcomes) {
        expect(outcome).toMatchObject({
          status: 'rejected',
          reason: expect.any(IntentraCallerForbiddenException),
        });
      }
    });

    it('reaches no Project but its own', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      const payroll = await app
        .get(ProjectsService)
        .create(ada, workspaceId, { name: 'Payroll', slug: 'payroll' });
      const intentra = intentraCaller(projectId);

      // Act
      const listing = app
        .get(KnowledgeService)
        .list(intentra, workspaceId, payroll.id, firstPage);

      // Assert
      await expect(listing).rejects.toBeInstanceOf(ProjectNotFoundException);
    });
  });

  describe('access', () => {
    it.each([
      [ProjectRole.Viewer, []],
      [ProjectRole.Contributor, KnowledgeKindDtoSchema.options],
    ])('tells a %o which Kinds they may record', async (bobRole, kinds) => {
      // Arrange
      const { workspaceId, projectId, bob } = await setUp(bobRole);

      // Act
      const page = await app
        .get(KnowledgeService)
        .list(person(bob), workspaceId, projectId, firstPage);

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
        .record(person(bob), workspaceId, projectId, term('Invoice'));

      // Act
      await app.get(MembersService).leave(bob, workspaceId);

      // Assert
      const page = await app
        .get(KnowledgeService)
        .list(person(ada), workspaceId, projectId, firstPage);
      expect(page.total).toBe(1);
    });

    it('deletes the knowledge and its numbering with its Project', async () => {
      // Arrange
      const { workspaceId, projectId, ada } = await setUp();
      await app
        .get(KnowledgeService)
        .record(person(ada), workspaceId, projectId, term('Invoice'));

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
        .record(person(ada), workspaceId, projectId, term('Invoice'));

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
