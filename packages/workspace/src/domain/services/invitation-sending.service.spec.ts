import { describe, expect, it } from 'vitest';

import { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import { Invitation, Member, Workspace } from '../entities/index.js';
import {
  AlreadyWorkspaceMemberException,
  NotWorkspaceOwnerException,
} from '../exceptions/index.js';
import { InvitationStatus } from '../value-objects/index.js';

import { InvitationSendingService } from './invitation-sending.service.js';
import { WorkspaceCreationService } from './workspace-creation.service.js';

const email = 'bob@example.com';

function createWorkspace(): { workspace: Workspace; owner: Member } {
  return new WorkspaceCreationService().create({
    name: 'Acme Corp',
    slug: 'acme-corp',
    accountId: new AccountId().value,
    email: 'ada@example.com',
  });
}

function joinMember(workspaceId: WorkspaceId): Member {
  return Member.join({
    workspaceId: workspaceId.value,
    accountId: new AccountId().value,
    email,
  });
}

describe('InvitationSendingService', () => {
  const service = new InvitationSendingService();

  it('lets the Owner invite an email', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();

    // Act
    const invitation = service.send(workspace, owner, {
      email,
      invitee: null,
      existing: null,
    });

    // Assert
    expect(invitation.workspaceId.equals(workspace.id)).toBe(true);
    expect(invitation.invitedBy.equals(owner.id)).toBe(true);
    expect(invitation.email.value).toBe(email);
    expect(invitation.status).toBe(InvitationStatus.Pending);
  });

  it('rejects a Contributor', () => {
    // Arrange
    const { workspace } = createWorkspace();
    const contributor = joinMember(workspace.id);

    // Act
    const sending = () =>
      service.send(workspace, contributor, {
        email: 'eve@example.com',
        invitee: null,
        existing: null,
      });

    // Assert
    expect(sending).toThrow(NotWorkspaceOwnerException);
  });

  it('rejects an email that belongs to an Active Member', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const invitee = joinMember(workspace.id);

    // Act
    const sending = () =>
      service.send(workspace, owner, { email, invitee, existing: null });

    // Assert
    expect(sending).toThrow(AlreadyWorkspaceMemberException);
  });

  it('invites a Removed Member again', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const invitee = joinMember(workspace.id);
    invitee.remove();

    // Act
    const invitation = service.send(workspace, owner, {
      email,
      invitee,
      existing: null,
    });

    // Assert
    expect(invitation.isPending()).toBe(true);
  });

  it('reopens the Invitation the email already has', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const existing = Invitation.create({
      workspaceId: workspace.id.value,
      email,
      invitedBy: owner.id.value,
    });
    existing.decline();

    // Act
    const invitation = service.send(workspace, owner, {
      email,
      invitee: null,
      existing,
    });

    // Assert
    expect(invitation).toBe(existing);
    expect(invitation.status).toBe(InvitationStatus.Pending);
  });
});
