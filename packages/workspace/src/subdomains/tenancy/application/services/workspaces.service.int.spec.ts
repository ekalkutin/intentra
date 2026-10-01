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

import { TestingApp } from '@intentra/platform-testing';
import { UnitOfWork } from '@intentra/shared-kernel';

import { givenAccount } from '../../../../testing/account.fixtures.js';
import { givenOpenWorkspaceCreation } from '../../../../testing/workspace-creation.fixtures.js';
import { WorkspaceModule } from '../../../../workspace.module.js';
import { Member } from '../../domain/entities/index.js';
import { WorkspaceSlugMismatchException } from '../../domain/exceptions/index.js';
import { WorkspaceSlugTakenException } from '../exceptions/index.js';
import { MemberRepository } from '../ports/outbound/index.js';

import { InvitationsService } from './invitations.service.js';
import { ProjectsService } from './projects.service.js';
import { WorkspacesService } from './workspaces.service.js';

describe('WorkspacesService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  beforeEach(() => givenOpenWorkspaceCreation(app));

  afterEach(async () => {
    vi.restoreAllMocks();
    await app.clearDatabase();
  });

  afterAll(() => app?.close());

  describe('create', () => {
    it('lists the new Workspace for its creator', async () => {
      // Arrange
      const service = app.get(WorkspacesService);
      const ada = await givenAccount(app);

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
        suspended: false,
      });
      await expect(service.list(ada)).resolves.toEqual([created]);
    });

    it('rejects a slug another Workspace already has', async () => {
      // Arrange
      const service = app.get(WorkspacesService);
      await service.create(await givenAccount(app), {
        name: 'Acme',
        slug: 'acme',
      });

      // Act
      const creation = service.create(await givenAccount(app), {
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
      const ada = await givenAccount(app);
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
      const ada = await givenAccount(app);
      await service.create(ada, { name: 'Zeta', slug: 'zeta' });
      await service.create(ada, { name: 'Alpha', slug: 'alpha' });
      await service.create(await givenAccount(app), {
        name: 'Beta',
        slug: 'beta',
      });

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
      const ada = await givenAccount(app);
      const bob = await givenAccount(app);
      const workspace = await service.create(ada, {
        name: 'Acme',
        slug: 'acme',
      });
      const member = Member.join({
        workspaceId: workspace.id,
        accountId: bob.accountId,
        email: bob.email,
        name: bob.name,
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
      const ada = await givenAccount(app);
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
          .listReceived({ ...ada, email: 'bob@example.com' }),
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
      const ada = await givenAccount(app);
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
});
