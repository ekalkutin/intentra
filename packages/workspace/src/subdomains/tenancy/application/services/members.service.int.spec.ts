import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import { AccountId, UnitOfWork } from '@intentra/shared-kernel';

import { WorkspaceModule } from '../../../../workspace.module.js';
import { Member } from '../../domain/entities/index.js';
import {
  LastOwnerCannotLeaveException,
  LastOwnerCannotStepDownException,
  NotWorkspaceOwnerException,
} from '../../domain/exceptions/index.js';
import { MemberId, Role } from '../../domain/value-objects/index.js';
import {
  MemberNotFoundException,
  WorkspaceNotFoundException,
} from '../exceptions/index.js';
import { MemberRepository } from '../ports/outbound/index.js';

import { MembersService } from './members.service.js';
import { WorkspacesService } from './workspaces.service.js';

function actor(email: string): Actor {
  return { accountId: new AccountId().value, email, isPlatformAdmin: false };
}

describe('MembersService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  async function createWorkspace(owner: Actor): Promise<string> {
    const workspace = await app
      .get(WorkspacesService)
      .create(owner, { name: 'Acme', slug: 'acme' });

    return workspace.id;
  }

  async function addMember(workspaceId: string, member: Member): Promise<void> {
    await app.get(UnitOfWork).run(() => app.get(MemberRepository).save(member));
  }

  it('lists the Active Members sorted by email, with their Roles', async () => {
    // Arrange
    const zoe = actor('zoe@example.com');
    const workspaceId = await createWorkspace(zoe);
    const bob = actor('bob@example.com');
    await addMember(
      workspaceId,
      Member.join({ workspaceId, accountId: bob.accountId, email: bob.email }),
    );

    // Act
    const members = await app.get(MembersService).list(bob, workspaceId);

    // Assert
    expect(members).toEqual([
      {
        id: expect.any(String),
        email: 'bob@example.com',
        role: null,
      },
      {
        id: expect.any(String),
        email: 'zoe@example.com',
        role: 'owner',
      },
    ]);
  });

  it('hides a Removed Member', async () => {
    // Arrange
    const ada = actor('ada@example.com');
    const workspaceId = await createWorkspace(ada);
    const removed = Member.join({
      workspaceId,
      accountId: new AccountId().value,
      email: 'bob@example.com',
    });
    removed.remove();
    await addMember(workspaceId, removed);

    // Act
    const members = await app.get(MembersService).list(ada, workspaceId);

    // Assert
    expect(members.map(member => member.email)).toEqual(['ada@example.com']);
  });

  it('hides the Workspace from an outsider', async () => {
    // Arrange
    const workspaceId = await createWorkspace(actor('ada@example.com'));

    // Act
    const listing = app
      .get(MembersService)
      .list(actor('eve@example.com'), workspaceId);

    // Assert
    await expect(listing).rejects.toBeInstanceOf(WorkspaceNotFoundException);
  });

  describe('remove', () => {
    it('takes away the removed Member’s access', async () => {
      // Arrange
      const ada = actor('ada@example.com');
      const bob = actor('bob@example.com');
      const workspaceId = await createWorkspace(ada);
      const member = Member.join({
        workspaceId,
        accountId: bob.accountId,
        email: bob.email,
      });
      await addMember(workspaceId, member);

      // Act
      await app.get(MembersService).remove(ada, workspaceId, member.id.value);

      // Assert
      await expect(
        app.get(MembersService).list(bob, workspaceId),
      ).rejects.toBeInstanceOf(WorkspaceNotFoundException);
    });

    it('reports a Member who is already gone as not found', async () => {
      // Arrange
      const ada = actor('ada@example.com');
      const workspaceId = await createWorkspace(ada);
      const member = Member.join({
        workspaceId,
        accountId: new AccountId().value,
        email: 'bob@example.com',
      });
      member.remove();
      await addMember(workspaceId, member);

      // Act
      const removal = app
        .get(MembersService)
        .remove(ada, workspaceId, member.id.value);

      // Assert
      await expect(removal).rejects.toBeInstanceOf(MemberNotFoundException);
    });
  });

  describe('leave', () => {
    it('takes away the leaving Member’s access', async () => {
      // Arrange
      const ada = actor('ada@example.com');
      const bob = actor('bob@example.com');
      const workspaceId = await createWorkspace(ada);
      await addMember(
        workspaceId,
        Member.join({
          workspaceId,
          accountId: bob.accountId,
          email: bob.email,
        }),
      );

      // Act
      await app.get(MembersService).leave(bob, workspaceId);

      // Assert
      await expect(app.get(WorkspacesService).list(bob)).resolves.toEqual([]);
    });

    it('lets an Owner leave while another Owner stays', async () => {
      // Arrange
      const ada = actor('ada@example.com');
      const bob = actor('bob@example.com');
      const workspaceId = await createWorkspace(ada);
      const owner = Member.join({
        workspaceId,
        accountId: bob.accountId,
        email: bob.email,
      });
      owner.changeRole(Role.Owner);
      await addMember(workspaceId, owner);

      // Act
      await app.get(MembersService).leave(ada, workspaceId);

      // Assert
      const members = await app.get(MembersService).list(bob, workspaceId);
      expect(members).toEqual([
        { id: owner.id.value, email: bob.email, role: 'owner' },
      ]);
    });

    it('does not let the last Owner leave', async () => {
      // Arrange
      const ada = actor('ada@example.com');
      const workspaceId = await createWorkspace(ada);

      // Act
      const leaving = app.get(MembersService).leave(ada, workspaceId);

      // Assert
      await expect(leaving).rejects.toBeInstanceOf(
        LastOwnerCannotLeaveException,
      );
    });
  });

  describe('changeRole', () => {
    async function joinBob(workspaceId: string): Promise<Member> {
      const bob = Member.join({
        workspaceId,
        accountId: new AccountId().value,
        email: 'bob@example.com',
      });
      await addMember(workspaceId, bob);

      return bob;
    }

    it('makes another Member an Owner', async () => {
      // Arrange
      const ada = actor('ada@example.com');
      const workspaceId = await createWorkspace(ada);
      const bob = await joinBob(workspaceId);

      // Act
      const changed = await app
        .get(MembersService)
        .changeRole(ada, workspaceId, bob.id.value, { role: 'owner' });

      // Assert
      expect(changed).toEqual({
        id: bob.id.value,
        email: 'bob@example.com',
        role: 'owner',
      });
      const members = await app.get(MembersService).list(ada, workspaceId);
      expect(members.map(member => member.role)).toEqual(['owner', 'owner']);
    });

    it('lets an Owner step down while another Owner stays', async () => {
      // Arrange
      const ada = actor('ada@example.com');
      const workspaceId = await createWorkspace(ada);
      const bob = await joinBob(workspaceId);
      await app
        .get(MembersService)
        .changeRole(ada, workspaceId, bob.id.value, { role: 'owner' });
      const [adaMember] = await app.get(MembersService).list(ada, workspaceId);

      // Act
      const changed = await app
        .get(MembersService)
        .changeRole(ada, workspaceId, adaMember!.id, { role: null });

      // Assert
      expect(changed.role).toBeNull();
    });

    it('does not let the last Owner step down', async () => {
      // Arrange
      const ada = actor('ada@example.com');
      const workspaceId = await createWorkspace(ada);
      const [adaMember] = await app.get(MembersService).list(ada, workspaceId);

      // Act
      const changing = app
        .get(MembersService)
        .changeRole(ada, workspaceId, adaMember!.id, { role: null });

      // Assert
      await expect(changing).rejects.toBeInstanceOf(
        LastOwnerCannotStepDownException,
      );
    });

    it('rejects a Member without a Role', async () => {
      // Arrange
      const ada = actor('ada@example.com');
      const bobActor = actor('bob@example.com');
      const workspaceId = await createWorkspace(ada);
      const bob = Member.join({
        workspaceId,
        accountId: bobActor.accountId,
        email: bobActor.email,
      });
      await addMember(workspaceId, bob);

      // Act
      const changing = app
        .get(MembersService)
        .changeRole(bobActor, workspaceId, bob.id.value, { role: 'owner' });

      // Assert
      await expect(changing).rejects.toBeInstanceOf(NotWorkspaceOwnerException);
    });

    it('reports a Member who is not in the Workspace as missing', async () => {
      // Arrange
      const ada = actor('ada@example.com');
      const workspaceId = await createWorkspace(ada);

      // Act
      const changing = app
        .get(MembersService)
        .changeRole(ada, workspaceId, new MemberId().value, { role: 'owner' });

      // Assert
      await expect(changing).rejects.toBeInstanceOf(MemberNotFoundException);
    });
  });
});
