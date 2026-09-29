import { DomainException } from '@intentra/shared-kernel';

export class UnknownMemberStatusException extends DomainException<'UNKNOWN_MEMBER_STATUS'> {
  constructor() {
    super('Member status is not known', 'UNKNOWN_MEMBER_STATUS');
  }
}
