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

import { Member } from '../../domain/entities/index.js';
import {
  NotWorkspaceOwnerException,
  WorkspaceSlugMismatchException,
} from '../../domain/exceptions/index.js';
import { MemberId } from '../../domain/value-objects/index.js';
import { WorkspaceModule } from '../../workspace.module.js';
import {
  MemberNotFoundException,
  WorkspaceSlugTakenException,
} from '../exceptions/index.js';
import { MemberRepository } from '../ports/outbound/index.js';

import { InvitationsService } from './invitations.service.js';
import { MembersService } from './members.service.js';
import { ProjectsService } from './projects.service.js';
import { WorkspacesService } from './workspaces.service.js';

function actor(): Actor {
  return { accountId: new AccountId().value, email: 'ada@example.com' };
}

describe('WorkspacesService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.clearDatabase();
  });

  afterAll(() => app?.close());

  describe('create', () => {
    it('lists the new Workspace for its creator', async () => {
      // Arrange
      const service = app.get(WorkspacesService);
      const ada = actor();

      // Act
      const created = await service.create(ada, {
        name: 'Acme Corp',
        slug: 'acme-corp',
      });

      // Assert
      expect(created).toEqual({
        id: expect.any(String),
        name: 'Acme Corp',
        slug: 'acme-corp',
      });
      await expect(service.list(ada)).resolves.toEqual([created]);
    });

    it('rejects a slug another Workspace already has', async () => {
      // Arrange
      const service = app.get(WorkspacesService);
      await service.create(actor(), { name: 'Acme', slug: 'acme' });

      // Act
      const creation = service.create(actor(), {
        name: 'Other Acme',
        slug: 'acme',
      });

      // Assert
      await expect(creation).rejects.toBeInstanceOf(
        WorkspaceSlugTakenException,
      );
    });

    it('keeps nothing when saving the Owner fails', async () => {
      // Arrange
      const service = app.get(WorkspacesService);
      const ada = actor();
      vi.spyOn(app.get(MemberRepository), 'save').mockRejectedValueOnce(
        new Error('Owner not saved'),
      );

      // Act
      const creation = service.create(ada, { name: 'Acme', slug: 'acme' });

      // Assert
      await expect(creation).rejects.toThrow('Owner not saved');
      await expect(
        service.create(ada, { name: 'Acme', slug: 'acme' }),
      ).resolves.toMatchObject({ slug: 'acme' });
    });
  });

  describe('list', () => {
    it('shows only the Actor’s Workspaces, sorted by name', async () => {
      // Arrange
      const service = app.get(WorkspacesService);
      const ada = actor();
      await service.create(ada, { name: 'Zeta', slug: 'zeta' });
      await service.create(ada, { name: 'Alpha', slug: 'alpha' });
      await service.create(actor(), { name: 'Beta', slug: 'beta' });

      // Act
      const workspaces = await service.list(ada);

      // Assert
      expect(workspaces.map(workspace => workspace.slug)).toEqual([
        'alpha',
        'zeta',
      ]);
    });

    it('hides a Workspace the Actor was removed from', async () => {
      // Arrange
      const service = app.get(WorkspacesService);
      const ada = actor();
      const bob = actor();
      const workspace = await service.create(ada, {
        name: 'Acme',
        slug: 'acme',
      });
      const member = Member.join({
        workspaceId: workspace.id,
        accountId: bob.accountId,
        email: bob.email,
      });
      member.remove();
      await app
        .get(UnitOfWork)
        .run(() => app.get(MemberRepository).save(member));

      // Act
      const workspaces = await service.list(bob);

      // Assert
      expect(workspaces).toEqual([]);
    });
  });

  describe('delete', () => {
    it('deletes the Workspace with everything in it and frees its slug', async () => {
      // Arrange
      const service = app.get(WorkspacesService);
      const ada = actor();
      const workspace = await service.create(ada, {
        name: 'Acme',
        slug: 'acme',
      });
      await app
        .get(ProjectsService)
        .create(ada, workspace.id, { name: 'Billing', slug: 'billing' });
      await app
        .get(InvitationsService)
        .create(ada, workspace.id, { email: 'bob@example.com' });

      // Act
      await service.delete(ada, workspace.id, { slug: 'acme' });

      // Assert
      await expect(service.list(ada)).resolves.toEqual([]);
      await expect(
        app
          .get(InvitationsService)
          .listReceived({ ...actor(), email: 'bob@example.com' }),
      ).resolves.toEqual([]);
      const recreated = await service.create(ada, {
        name: 'Acme',
        slug: 'acme',
      });
      await expect(
        app.get(ProjectsService).list(ada, recreated.id),
      ).resolves.toEqual([]);
    });

    it('keeps everything when the slug does not match', async () => {
      // Arrange
      const service = app.get(WorkspacesService);
      const ada = actor();
      const workspace = await service.create(ada, {
        name: 'Acme',
        slug: 'acme',
      });

      // Act
      const deletion = service.delete(ada, workspace.id, { slug: 'acm' });

      // Assert
      await expect(deletion).rejects.toBeInstanceOf(
        WorkspaceSlugMismatchException,
      );
      await expect(service.list(ada)).resolves.toEqual([workspace]);
    });
  });

  describe('transferOwnership', () => {
    async function createWithMember(): Promise<{
      workspaceId: string;
      ada: Actor;
      bob: Actor;
      bobId: string;
    }> {
      const ada = actor();
      const bob = actor();
      const workspace = await app
        .get(WorkspacesService)
        .create(ada, { name: 'Acme', slug: 'acme' });
      const member = Member.join({
        workspaceId: workspace.id,
        accountId: bob.accountId,
        email: 'bob@example.com',
      });
      await app
        .get(UnitOfWork)
        .run(() => app.get(MemberRepository).save(member));

      return { workspaceId: workspace.id, ada, bob, bobId: member.id.value };
    }

    it('makes the new Owner and keeps the former one as a Member', async () => {
      // Arrange
      const { workspaceId, ada, bobId } = await createWithMember();

      // Act
      await app
        .get(WorkspacesService)
        .transferOwnership(ada, workspaceId, { memberId: bobId });

      // Assert
      const members = await app.get(MembersService).list(ada, workspaceId);
      expect(
        members.map(({ id, isOwner }) => ({ id, isOwner })),
      ).toContainEqual({ id: bobId, isOwner: true });
      expect(members.filter(member => member.isOwner)).toHaveLength(1);
    });

    it('rejects a Contributor', async () => {
      // Arrange
      const { workspaceId, bob, bobId } = await createWithMember();

      // Act
      const transfer = app
        .get(WorkspacesService)
        .transferOwnership(bob, workspaceId, { memberId: bobId });

      // Assert
      await expect(transfer).rejects.toBeInstanceOf(NotWorkspaceOwnerException);
    });

    it('rejects a Member who is not in the Workspace', async () => {
      // Arrange
      const { workspaceId, ada } = await createWithMember();

      // Act
      const transfer = app
        .get(WorkspacesService)
        .transferOwnership(ada, workspaceId, {
          memberId: new MemberId().value,
        });

      // Assert
      await expect(transfer).rejects.toBeInstanceOf(MemberNotFoundException);
    });
  });
});
