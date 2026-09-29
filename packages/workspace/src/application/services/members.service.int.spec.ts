import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import { AccountId, UnitOfWork } from '@intentra/shared-kernel';

import { Member } from '../../domain/entities/index.js';
import { WorkspaceModule } from '../../workspace.module.js';
import { WorkspaceNotFoundException } from '../exceptions/index.js';
import { MemberRepository } from '../ports/outbound/index.js';

import { MembersService } from './members.service.js';
import { WorkspacesService } from './workspaces.service.js';

function actor(email: string): Actor {
  return { accountId: new AccountId().value, email };
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

  it('lists the Active Members sorted by email, marking the Owner', async () => {
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
        role: 'contributor',
        isOwner: false,
      },
      {
        id: expect.any(String),
        email: 'zoe@example.com',
        role: 'contributor',
        isOwner: true,
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
});
