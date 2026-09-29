import { ConflictException } from '@intentra/shared-kernel';

export class InvitationExpiredException extends ConflictException<'INVITATION_EXPIRED'> {
  constructor() {
    super('Invitation has expired', 'INVITATION_EXPIRED');
  }
}
