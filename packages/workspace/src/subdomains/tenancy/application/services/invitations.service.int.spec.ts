import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { Actor } from '@intentra/contracts/iam';
import { TestingApp } from '@intentra/platform-testing';

import { givenAccount } from '../../../../testing/account.fixtures.js';
import { WorkspaceModule } from '../../../../workspace.module.js';
import {
  AlreadyWorkspaceMemberException,
  InvitationNotPendingException,
  NotWorkspaceOwnerException,
} from '../../domain/exceptions/index.js';
import {
  InvitationNotFoundException,
  WorkspaceNotFoundException,
} from '../exceptions/index.js';

import { InvitationsService } from './invitations.service.js';
import { WorkspacesService } from './workspaces.service.js';

describe('InvitationsService integration', () => {
  let app: TestingApp;
  let service: InvitationsService;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
    service = app.get(InvitationsService);
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  async function createWorkspace(owner: Actor): Promise<string> {
    const workspace = await app
      .get(WorkspacesService)
      .create(owner, { name: 'Acme', slug: 'acme' });

    return workspace.id;
  }

  async function join(workspaceId: string, invitee: Actor, owner: Actor) {
    const invitation = await service.create(owner, workspaceId, {
      email: invitee.email,
    });

    return service.accept(invitee, invitation.id);
  }

  describe('create', () => {
    it('lets the Owner invite an email, stored lower-case', async () => {
      // Arrange
      const ada = await givenAccount(app, 'ada@example.com');
      const workspaceId = await createWorkspace(ada);

      // Act
      const invitation = await service.create(ada, workspaceId, {
        email: 'Bob@Example.com',
      });

      // Assert
      expect(invitation).toEqual({
        id: expect.any(String),
        workspaceId,
        workspaceName: 'Acme',
        email: 'bob@example.com',
        status: 'pending',
        sentAt: expect.any(String),
        expiresAt: expect.any(String),
      });
      await expect(service.list(ada, workspaceId)).resolves.toEqual([
        invitation,
      ]);
    });

    it('reopens the same Invitation when the email is invited again', async () => {
      // Arrange
      const ada = await givenAccount(app, 'ada@example.com');
      const workspaceId = await createWorkspace(ada);
      const earlier = await service.create(ada, workspaceId, {
        email: 'bob@example.com',
      });
      await service.revoke(ada, workspaceId, earlier.id);

      // Act
      const again = await service.create(ada, workspaceId, {
        email: 'bob@example.com',
      });

      // Assert
      expect(again).toMatchObject({ id: earlier.id, status: 'pending' });
      await expect(service.list(ada, workspaceId)).resolves.toEqual([again]);
    });

    it('rejects the email of an Active Member', async () => {
      // Arrange
      const ada = await givenAccount(app, 'ada@example.com');
      const workspaceId = await createWorkspace(ada);

      // Act
      const creation = service.create(ada, workspaceId, {
        email: 'ada@example.com',
      });

      // Assert
      await expect(creation).rejects.toBeInstanceOf(
        AlreadyWorkspaceMemberException,
      );
    });

    it('lets only the Owner invite', async () => {
      // Arrange
      const ada = await givenAccount(app, 'ada@example.com');
      const bob = await givenAccount(app, 'bob@example.com');
      const workspaceId = await createWorkspace(ada);
      await join(workspaceId, bob, ada);

      // Act
      const creation = service.create(bob, workspaceId, {
        email: 'eve@example.com',
      });

      // Assert
      await expect(creation).rejects.toBeInstanceOf(NotWorkspaceOwnerException);
    });
  });

  describe('accept', () => {
    it('makes the invitee a Member of the Workspace', async () => {
      // Arrange
      const ada = await givenAccount(app, 'ada@example.com');
      const bob = await givenAccount(app, 'bob@example.com');
      const workspaceId = await createWorkspace(ada);

      // Act
      const accepted = await join(workspaceId, bob, ada);

      // Assert
      expect(accepted.status).toBe('accepted');
      await expect(app.get(WorkspacesService).list(bob)).resolves.toEqual([
        expect.objectContaining({ id: workspaceId }),
      ]);
    });

    it('cannot be accepted twice', async () => {
      // Arrange
      const ada = await givenAccount(app, 'ada@example.com');
      const bob = await givenAccount(app, 'bob@example.com');
      const workspaceId = await createWorkspace(ada);
      const invitation = await service.create(ada, workspaceId, {
        email: bob.email,
      });
      await service.accept(bob, invitation.id);

      // Act
      const acceptance = service.accept(bob, invitation.id);

      // Assert
      await expect(acceptance).rejects.toBeInstanceOf(
        InvitationNotPendingException,
      );
    });

    it('hides an Invitation addressed to another email', async () => {
      // Arrange
      const ada = await givenAccount(app, 'ada@example.com');
      const workspaceId = await createWorkspace(ada);
      const invitation = await service.create(ada, workspaceId, {
        email: 'bob@example.com',
      });

      // Act
      const acceptance = service.accept(
        await givenAccount(app, 'eve@example.com'),
        invitation.id,
      );

      // Assert
      await expect(acceptance).rejects.toBeInstanceOf(
        InvitationNotFoundException,
      );
    });
  });

  describe('decline', () => {
    it('closes the Invitation without making a Member', async () => {
      // Arrange
      const ada = await givenAccount(app, 'ada@example.com');
      const bob = await givenAccount(app, 'bob@example.com');
      const workspaceId = await createWorkspace(ada);
      const invitation = await service.create(ada, workspaceId, {
        email: bob.email,
      });

      // Act
      const declined = await service.decline(bob, invitation.id);

      // Assert
      expect(declined.status).toBe('declined');
      await expect(service.listReceived(bob)).resolves.toEqual([]);
      await expect(app.get(WorkspacesService).list(bob)).resolves.toEqual([]);
    });
  });

  describe('revoke', () => {
    it('stops the invitee from accepting', async () => {
      // Arrange
      const ada = await givenAccount(app, 'ada@example.com');
      const bob = await givenAccount(app, 'bob@example.com');
      const workspaceId = await createWorkspace(ada);
      const invitation = await service.create(ada, workspaceId, {
        email: bob.email,
      });

      // Act
      const revoked = await service.revoke(ada, workspaceId, invitation.id);

      // Assert
      expect(revoked.status).toBe('revoked');
      await expect(service.accept(bob, invitation.id)).rejects.toBeInstanceOf(
        InvitationNotPendingException,
      );
    });
  });

  describe('listReceived', () => {
    it('shows the Pending Invitations addressed to the Actor', async () => {
      // Arrange
      const ada = await givenAccount(app, 'ada@example.com');
      const bob = await givenAccount(app, 'bob@example.com');
      const workspaceId = await createWorkspace(ada);
      const invitation = await service.create(ada, workspaceId, {
        email: bob.email,
      });
      await service.create(ada, workspaceId, { email: 'eve@example.com' });

      // Act
      const received = await service.listReceived(bob);

      // Assert
      expect(received).toEqual([invitation]);
    });
  });

  describe('list', () => {
    it('hides the Workspace from an outsider', async () => {
      // Arrange
      const workspaceId = await createWorkspace(
        await givenAccount(app, 'ada@example.com'),
      );

      // Act
      const listing = service.list(
        await givenAccount(app, 'eve@example.com'),
        workspaceId,
      );

      // Assert
      await expect(listing).rejects.toBeInstanceOf(WorkspaceNotFoundException);
    });
  });
});
