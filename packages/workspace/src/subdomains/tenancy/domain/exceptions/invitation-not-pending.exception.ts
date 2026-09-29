import { ConflictException } from '@intentra/shared-kernel';

export class InvitationNotPendingException extends ConflictException<'INVITATION_NOT_PENDING'> {
  constructor() {
    super(
      'Invitation has already been accepted, declined or revoked',
      'INVITATION_NOT_PENDING',
    );
  }
}
