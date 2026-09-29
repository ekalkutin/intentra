export type InvitationStatusDto =
  'pending' | 'accepted' | 'declined' | 'revoked' | 'expired';

export type InvitationDto = {
  readonly id: string;
  readonly workspaceId: string;
  readonly workspaceName: string;
  readonly email: string;
  readonly status: InvitationStatusDto;
  /** ISO 8601 */
  readonly sentAt: string;
  /** ISO 8601 */
  readonly expiresAt: string;
};
