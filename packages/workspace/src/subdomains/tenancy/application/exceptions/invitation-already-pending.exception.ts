import { ConflictException } from '@intentra/shared-kernel';

export class InvitationAlreadyPendingException extends ConflictException<'INVITATION_ALREADY_PENDING'> {
  constructor() {
    super(
      'Another invitation to this email is already pending',
      'INVITATION_ALREADY_PENDING',
    );
  }
}
