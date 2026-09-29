import { describe, expect, it } from 'vitest';

import { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import { Invitation, Member } from '../entities/index.js';
import { AlreadyWorkspaceMemberException } from '../exceptions/index.js';
import { InvitationStatus, MemberId } from '../value-objects/index.js';

import { InvitationAcceptanceService } from './invitation-acceptance.service.js';

const workspaceId = new WorkspaceId();
const accountId = new AccountId();

function invite(): Invitation {
  return Invitation.create({
    workspaceId: workspaceId.value,
    email: 'bob@example.com',
    invitedBy: new MemberId().value,
  });
}

function joinMember(): Member {
  return Member.join({
    workspaceId: workspaceId.value,
    accountId: accountId.value,
    email: 'bob@example.com',
  });
}

describe('InvitationAcceptanceService', () => {
  const service = new InvitationAcceptanceService();

  it('makes the invitee a new Active Member', () => {
    // Arrange
    const invitation = invite();

    // Act
    const member = service.accept(invitation, {
      accountId: accountId.value,
      member: null,
    });

    // Assert
    expect(invitation.status).toBe(InvitationStatus.Accepted);
    expect(member.belongsTo(workspaceId)).toBe(true);
    expect(member.accountId.equals(accountId)).toBe(true);
    expect(member.email.value).toBe('bob@example.com');
    expect(member.isActive()).toBe(true);
  });

  it('brings a Removed Member back instead of adding a second one', () => {
    // Arrange
    const removed = joinMember();
    removed.remove();
    const invitation = invite();

    // Act
    const member = service.accept(invitation, {
      accountId: accountId.value,
      member: removed,
    });

    // Assert
    expect(member).toBe(removed);
    expect(member.isActive()).toBe(true);
  });

  it('rejects an Account that is already an Active Member', () => {
    // Arrange
    const invitation = invite();
    const member = joinMember();

    // Act
    const accepting = () =>
      service.accept(invitation, {
        accountId: accountId.value,
        member,
      });

    // Assert
    expect(accepting).toThrow(AlreadyWorkspaceMemberException);
  });
});
