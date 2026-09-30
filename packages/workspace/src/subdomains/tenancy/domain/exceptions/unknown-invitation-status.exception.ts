import { DomainException } from '@intentra/shared-kernel';

export class UnknownInvitationStatusException extends DomainException<'UNKNOWN_INVITATION_STATUS'> {
  constructor() {
    super('Invitation status is not known', 'UNKNOWN_INVITATION_STATUS');
  }
}
