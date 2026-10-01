import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';
import { NotPlatformAdminException } from '@intentra/shared-kernel';

import { PlatformWorkspacesService } from '../../../../platform-workspaces.service.js';
import { givenAccount } from '../../../../testing/account.fixtures.js';
import { WorkspaceModule } from '../../../../workspace.module.js';
import { WorkspaceCreationClosedException } from '../../domain/exceptions/index.js';

import { WorkspacesService } from './workspaces.service.js';

describe('Open Workspace Creation', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  async function givenPlatformAdmin(): Promise<Actor> {
    return {
      ...(await givenAccount(app, 'admin@example.com')),
      isPlatformAdmin: true,
    };
  }

  describe('create', () => {
    it('refuses someone who is not a Platform Admin while it is closed', async () => {
      // Arrange
      const ada = await givenAccount(app);

      // Act
      const creation = app
        .get(WorkspacesService)
        .create(ada, { name: 'Acme', slug: 'acme' });

      // Assert
      await expect(creation).rejects.toBeInstanceOf(
        WorkspaceCreationClosedException,
      );
      await expect(app.get(WorkspacesService).list(ada)).resolves.toEqual([]);
    });

    it('lets a Platform Admin create a Workspace while it is closed', async () => {
      // Arrange
      const admin = await givenPlatformAdmin();

      // Act
      const created = await app
        .get(WorkspacesService)
        .create(admin, { name: 'Acme', slug: 'acme' });

      // Assert
      expect(created).toMatchObject({ name: 'Acme', slug: 'acme' });
    });

    it('lets anyone create a Workspace once a Platform Admin opens it', async () => {
      // Arrange
      const admin = await givenPlatformAdmin();
      const ada = await givenAccount(app);
      await app
        .get(PlatformWorkspacesService)
        .setCreation(admin, { open: true });

      // Act
      const created = await app
        .get(WorkspacesService)
        .create(ada, { name: 'Acme', slug: 'acme' });

      // Assert
      expect(created).toMatchObject({ name: 'Acme', slug: 'acme' });
    });

    it('refuses again once a Platform Admin closes it', async () => {
      // Arrange
      const admin = await givenPlatformAdmin();
      const ada = await givenAccount(app);
      await app
        .get(PlatformWorkspacesService)
        .setCreation(admin, { open: true });
      await app
        .get(PlatformWorkspacesService)
        .setCreation(admin, { open: false });

      // Act
      const creation = app
        .get(WorkspacesService)
        .create(ada, { name: 'Acme', slug: 'acme' });

      // Assert
      await expect(creation).rejects.toBeInstanceOf(
        WorkspaceCreationClosedException,
      );
    });
  });

  describe('getCreationAccess', () => {
    it('denies someone who is not a Platform Admin while it is closed', async () => {
      // Arrange
      const ada = await givenAccount(app);

      // Act
      const access = await app.get(WorkspacesService).getCreationAccess(ada);

      // Assert
      expect(access).toEqual({ canCreate: false });
    });

    it('allows a Platform Admin while it is closed', async () => {
      // Arrange
      const admin = await givenPlatformAdmin();

      // Act
      const access = await app.get(WorkspacesService).getCreationAccess(admin);

      // Assert
      expect(access).toEqual({ canCreate: true });
    });

    it('allows anyone once it is open', async () => {
      // Arrange
      const admin = await givenPlatformAdmin();
      const ada = await givenAccount(app);
      await app
        .get(PlatformWorkspacesService)
        .setCreation(admin, { open: true });

      // Act
      const access = await app.get(WorkspacesService).getCreationAccess(ada);

      // Assert
      expect(access).toEqual({ canCreate: true });
    });
  });

  describe('the switch', () => {
    it('is off until a Platform Admin turns it on', async () => {
      // Arrange
      const admin = await givenPlatformAdmin();

      // Act
      const before = await app
        .get(PlatformWorkspacesService)
        .getCreation(admin);
      const turnedOn = await app
        .get(PlatformWorkspacesService)
        .setCreation(admin, { open: true });

      // Assert
      expect(before).toEqual({ open: false });
      expect(turnedOn).toEqual({ open: true });
      await expect(
        app.get(PlatformWorkspacesService).getCreation(admin),
      ).resolves.toEqual({ open: true });
    });

    it('is read only by a Platform Admin', async () => {
      // Arrange
      const ada = await givenAccount(app);

      // Act
      const reading = app.get(PlatformWorkspacesService).getCreation(ada);

      // Assert
      await expect(reading).rejects.toBeInstanceOf(NotPlatformAdminException);
    });

    it('is left to a Platform Admin', async () => {
      // Arrange
      const ada = await givenAccount(app);

      // Act
      const opening = app
        .get(PlatformWorkspacesService)
        .setCreation(ada, { open: true });

      // Assert
      await expect(opening).rejects.toBeInstanceOf(NotPlatformAdminException);
      await expect(
        app.get(WorkspacesService).getCreationAccess(ada),
      ).resolves.toEqual({ canCreate: false });
    });
  });
});
