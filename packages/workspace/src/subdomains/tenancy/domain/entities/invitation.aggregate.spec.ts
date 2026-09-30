import { describe, expect, it } from 'vitest';

import { Email, WorkspaceId } from '@intentra/shared-kernel';

import {
  InvitationExpiredException,
  InvitationNotPendingException,
} from '../exceptions/index.js';
import {
  InvitationId,
  InvitationStatus,
  MemberId,
} from '../value-objects/index.js';

import { Invitation } from './invitation.aggregate.js';

function invite(): Invitation {
  return Invitation.create({
    workspaceId: new WorkspaceId().value,
    email: 'Bob@Example.com',
    invitedBy: new MemberId().value,
  });
}

function inviteExpired(
  status: InvitationStatus = InvitationStatus.Pending,
): Invitation {
  const now = Temporal.Now.instant();

  return Invitation.restore({
    id: new InvitationId().value,
    workspaceId: new WorkspaceId().value,
    email: 'bob@example.com',
    invitedBy: new MemberId().value,
    sentAt: now.subtract({ hours: 8 * 24 }),
    expiresAt: now.subtract({ hours: 24 }),
    status: status.value,
  });
}

describe('Invitation', () => {
  it('is Pending for 7 days', () => {
    // Act
    const invitation = invite();

    // Assert
    expect(invitation.status).toBe(InvitationStatus.Pending);
    expect(invitation.sentAt.until(invitation.expiresAt).total('hours')).toBe(
      7 * 24,
    );
  });

  it('reads as Expired once its time is up', () => {
    // Arrange
    const invitation = inviteExpired();

    // Act
    const status = invitation.status;

    // Assert
    expect(status).toBe(InvitationStatus.Expired);
  });

  it('stays closed after its time is up', () => {
    // Arrange
    const invitation = inviteExpired(InvitationStatus.Accepted);

    // Act
    const status = invitation.status;

    // Assert
    expect(status).toBe(InvitationStatus.Accepted);
  });

  it('is addressed to its email in any case', () => {
    // Arrange
    const invitation = invite();

    // Act
    const addressedToBob = invitation.isAddressedTo(
      new Email('bob@example.com'),
    );
    const addressedToEve = invitation.isAddressedTo(
      new Email('eve@example.com'),
    );

    // Assert
    expect(addressedToBob).toBe(true);
    expect(addressedToEve).toBe(false);
  });

  it.each([
    ['accept', InvitationStatus.Accepted],
    ['decline', InvitationStatus.Declined],
    ['revoke', InvitationStatus.Revoked],
  ] as const)('can %s while Pending', (action, status) => {
    // Arrange
    const invitation = invite();

    // Act
    invitation[action]();

    // Assert
    expect(invitation.status).toBe(status);
  });

  it.each(['accept', 'decline', 'revoke'] as const)(
    'cannot %s once expired',
    action => {
      // Arrange
      const invitation = inviteExpired();

      // Act
      const acting = () => invitation[action]();

      // Assert
      expect(acting).toThrow(InvitationExpiredException);
    },
  );

  it.each(['accept', 'decline', 'revoke'] as const)(
    'cannot %s once closed',
    action => {
      // Arrange
      const invitation = invite();
      invitation.decline();

      // Act
      const acting = () => invitation[action]();

      // Assert
      expect(acting).toThrow(InvitationNotPendingException);
    },
  );

  it.each([
    ['Pending', () => invite()],
    ['Expired', () => inviteExpired()],
    ['Declined', () => inviteExpired(InvitationStatus.Declined)],
    ['Revoked', () => inviteExpired(InvitationStatus.Revoked)],
  ])('reopens from %s for another 7 days', (_, make) => {
    // Arrange
    const invitation = make();
    const id = invitation.id;
    const inviter = new MemberId();

    // Act
    invitation.reopen(inviter);

    // Assert
    expect(invitation.id).toBe(id);
    expect(invitation.status).toBe(InvitationStatus.Pending);
    expect(invitation.invitedBy).toBe(inviter);
    expect(invitation.sentAt.until(invitation.expiresAt).total('hours')).toBe(
      7 * 24,
    );
  });
});
