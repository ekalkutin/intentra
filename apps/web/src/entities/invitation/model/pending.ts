import type { InvitationDto } from '@intentra/contracts/workspace';

/** The invitation statuses; the contract types them without a schema. */
export const INVITATION_STATUSES = {
  pending: 'pending',
  accepted: 'accepted',
  declined: 'declined',
  revoked: 'revoked',
  expired: 'expired',
} as const satisfies Record<string, InvitationDto['status']>;

/** Invitations still waiting for an answer. */
export function pendingInvitations(
  invitations: readonly InvitationDto[],
): InvitationDto[] {
  return invitations.filter(
    invitation => invitation.status === INVITATION_STATUSES.pending,
  );
}
