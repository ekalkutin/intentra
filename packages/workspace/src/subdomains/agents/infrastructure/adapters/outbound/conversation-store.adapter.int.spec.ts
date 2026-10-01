import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import {
  AccountId,
  ProjectId,
  UnitOfWork,
  WorkspaceId,
} from '@intentra/shared-kernel';

import { WorkspaceModule } from '../../../../../workspace.module.js';
import {
  Member,
  MemberId,
  MemberRepository,
  MembersService,
  ProjectsService,
  WorkspacesService,
} from '../../../../tenancy/index.js';
import { ConversationStore } from '../../../application/ports/outbound/index.js';
import { Conversation } from '../../../domain/entities/index.js';
import { ConversationId } from '../../../domain/value-objects/index.js';

function actor(email: string): Actor {
  return { accountId: new AccountId().value, email, isPlatformAdmin: false };
}

type Owner = {
  readonly workspaceId: WorkspaceId;
  readonly projectId: ProjectId;
  readonly memberId: MemberId;
};

function start({ workspaceId, projectId, memberId }: Owner): Conversation {
  return Conversation.start({
    id: new ConversationId().value,
    workspaceId: workspaceId.value,
    projectId: projectId.value,
    memberId: memberId.value,
  });
}

describe('ConversationStore on Mastra Memory', () => {
  let app: TestingApp;
  let conversationStore: ConversationStore;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
    conversationStore = app.get(ConversationStore);
  });

  afterEach(async () => {
    vi.useRealTimers();
    await app.clearDatabase();
  });

  afterAll(() => app?.close());

  function owner(): Owner {
    return {
      workspaceId: new WorkspaceId(),
      projectId: new ProjectId(),
      memberId: new MemberId(),
    };
  }

  async function saved(conversation: Conversation): Promise<Conversation> {
    await conversationStore.save(conversation);
    return conversation;
  }

  it('keeps a started Conversation as it was', async () => {
    // Arrange
    const conversation = start(owner());

    // Act
    await conversationStore.save(conversation);

    // Assert
    const found = await conversationStore.findOne({ id: conversation.id });
    expect(found?.id.equals(conversation.id)).toBe(true);
    expect(found?.isOf(conversation.memberId, conversation.projectId)).toBe(
      true,
    );
    expect(found?.workspaceId.equals(conversation.workspaceId)).toBe(true);
    expect(found?.title).toBeNull();
    expect(found?.hidden).toBe(false);
  });

  it('keeps a new title and hiding, and nothing else changes', async () => {
    // Arrange
    const conversation = await saved(start(owner()));
    const before = await conversationStore.findOne({ id: conversation.id });
    conversation.rename('PDF export');
    conversation.hide();

    // Act
    await conversationStore.update(conversation);

    // Assert
    const found = await conversationStore.findOne({ id: conversation.id });
    expect(found?.title?.value).toBe('PDF export');
    expect(found?.hidden).toBe(true);
    expect(found?.isOf(conversation.memberId, conversation.projectId)).toBe(
      true,
    );
    expect(found?.workspaceId.equals(conversation.workspaceId)).toBe(true);
    expect(found?.createdAt).toEqual(before?.createdAt);
  });

  it("lists a Member's shown or hidden Conversations in a Project, the latest first", async () => {
    // Arrange
    const ada = owner();
    // Mastra stamps `updatedAt` from the clock: one Conversation per minute.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-30T10:00:00Z'));
    const first = await saved(start(ada));
    vi.setSystemTime(new Date('2026-09-30T10:01:00Z'));
    const second = await saved(start(ada));
    vi.setSystemTime(new Date('2026-09-30T10:02:00Z'));
    const hidden = await saved(start(ada));
    hidden.hide();
    await conversationStore.update(hidden);
    await saved(start({ ...ada, memberId: new MemberId() }));
    await saved(start({ ...ada, projectId: new ProjectId() }));

    // Act
    const [shown, hiddenOnes, secondPage] = await Promise.all([
      conversationStore.findMany({
        ...ada,
        hidden: false,
        take: 50,
        offset: 0,
      }),
      conversationStore.findMany({ ...ada, hidden: true, take: 50, offset: 0 }),
      conversationStore.findMany({ ...ada, hidden: false, take: 1, offset: 1 }),
    ]);

    // Assert
    expect(shown.items.map(({ id }) => id.value)).toEqual([
      second.id.value,
      first.id.value,
    ]);
    expect(shown.total).toBe(2);
    expect(hiddenOnes.items.map(({ id }) => id.value)).toEqual([
      hidden.id.value,
    ]);
    expect(secondPage.items.map(({ id }) => id.value)).toEqual([
      first.id.value,
    ]);
    expect(secondPage.total).toBe(2);
  });

  it('deletes one Conversation', async () => {
    // Arrange
    const kept = await saved(start(owner()));
    const deleted = await saved(start(owner()));

    // Act
    await conversationStore.delete(deleted.id);

    // Assert
    expect(await conversationStore.findOne({ id: deleted.id })).toBeNull();
    expect(await conversationStore.findOne({ id: kept.id })).not.toBeNull();
  });

  describe('cleanup', () => {
    it('deletes the Conversations of a deleted Project', async () => {
      // Arrange
      const ada = actor('ada@example.com');
      const workspace = await app
        .get(WorkspacesService)
        .create(ada, { name: 'Acme', slug: 'acme' });
      const projectsService = app.get(ProjectsService);
      const billing = await projectsService.create(ada, workspace.id, {
        name: 'Billing',
        slug: 'billing',
      });
      const payroll = await projectsService.create(ada, workspace.id, {
        name: 'Payroll',
        slug: 'payroll',
      });
      const [adaMember] = await app.get(MembersService).list(ada, workspace.id);
      const inBilling = await saved(
        start({
          workspaceId: new WorkspaceId(workspace.id),
          projectId: new ProjectId(billing.id),
          memberId: new MemberId(adaMember?.id),
        }),
      );
      const inPayroll = await saved(
        start({
          workspaceId: new WorkspaceId(workspace.id),
          projectId: new ProjectId(payroll.id),
          memberId: new MemberId(adaMember?.id),
        }),
      );

      // Act
      await projectsService.delete(ada, workspace.id, billing.id, {
        slug: 'billing',
      });

      // Assert
      expect(await conversationStore.findOne({ id: inBilling.id })).toBeNull();
      expect(
        await conversationStore.findOne({ id: inPayroll.id }),
      ).not.toBeNull();
    });

    it('deletes the Conversations of a deleted Workspace', async () => {
      // Arrange
      const ada = actor('ada@example.com');
      const workspace = await app
        .get(WorkspacesService)
        .create(ada, { name: 'Acme', slug: 'acme' });
      const inWorkspace = await saved(
        start({ ...owner(), workspaceId: new WorkspaceId(workspace.id) }),
      );
      const elsewhere = await saved(start(owner()));

      // Act
      await app
        .get(WorkspacesService)
        .delete(ada, workspace.id, { slug: 'acme' });

      // Assert
      expect(
        await conversationStore.findOne({ id: inWorkspace.id }),
      ).toBeNull();
      expect(
        await conversationStore.findOne({ id: elsewhere.id }),
      ).not.toBeNull();
    });

    it('deletes the Conversations of a Member who leaves', async () => {
      // Arrange
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
      await app
        .get(UnitOfWork)
        .run(() => app.get(MemberRepository).save(member));
      const bobs = await saved(
        start({
          ...owner(),
          workspaceId: new WorkspaceId(workspace.id),
          memberId: member.id,
        }),
      );
      const others = await saved(
        start({ ...owner(), workspaceId: new WorkspaceId(workspace.id) }),
      );

      // Act
      await app.get(MembersService).leave(bob, workspace.id);

      // Assert
      expect(await conversationStore.findOne({ id: bobs.id })).toBeNull();
      expect(await conversationStore.findOne({ id: others.id })).not.toBeNull();
    });
  });
});
