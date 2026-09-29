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
import { AccountId, UnitOfWork } from '@intentra/shared-kernel';

import { WorkspaceModule } from '../../../../workspace.module.js';
import { Member } from '../../domain/entities/index.js';
import { Cleanup, MemberRepository } from '../ports/outbound/index.js';

import { MembersService } from './members.service.js';
import { ProjectsService } from './projects.service.js';
import { WorkspacesService } from './workspaces.service.js';

function actor(email: string): Actor {
  return { accountId: new AccountId().value, email };
}

describe('Cleanup integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.clearDatabase();
  });

  afterAll(() => app?.close());

  async function createWorkspace(owner: Actor): Promise<string> {
    const workspace = await app
      .get(WorkspacesService)
      .create(owner, { name: 'Acme', slug: 'acme' });

    return workspace.id;
  }

  it('cleans up after a deleted Project', async () => {
    // Arrange
    const ada = actor('ada@example.com');
    const workspaceId = await createWorkspace(ada);
    const project = await app
      .get(ProjectsService)
      .create(ada, workspaceId, { name: 'Billing', slug: 'billing' });
    const cleaningUp = vi.spyOn(app.get(Cleanup), 'afterProjectDeleted');

    // Act
    await app
      .get(ProjectsService)
      .delete(ada, workspaceId, project.id, { slug: 'billing' });

    // Assert
    expect(cleaningUp.mock.calls.map(([id]) => id.value)).toEqual([project.id]);
  });

  it('cleans up after a deleted Workspace', async () => {
    // Arrange
    const ada = actor('ada@example.com');
    const workspaceId = await createWorkspace(ada);
    const cleaningUp = vi.spyOn(app.get(Cleanup), 'afterWorkspaceDeleted');

    // Act
    await app.get(WorkspacesService).delete(ada, workspaceId, { slug: 'acme' });

    // Assert
    expect(cleaningUp.mock.calls.map(([id]) => id.value)).toEqual([
      workspaceId,
    ]);
  });

  it('cleans up after a Member who leaves', async () => {
    // Arrange
    const ada = actor('ada@example.com');
    const bob = actor('bob@example.com');
    const workspaceId = await createWorkspace(ada);
    const member = Member.join({
      workspaceId,
      accountId: bob.accountId,
      email: bob.email,
    });
    await app.get(UnitOfWork).run(() => app.get(MemberRepository).save(member));
    const cleaningUp = vi.spyOn(app.get(Cleanup), 'afterMemberRemoved');

    // Act
    await app.get(MembersService).leave(bob, workspaceId);

    // Assert
    expect(cleaningUp.mock.calls.map(([id]) => id.value)).toEqual([
      member.id.value,
    ]);
  });
});
