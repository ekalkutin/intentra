import { DomainException } from '@intentra/shared-kernel';

export class MemberNotActiveException extends DomainException<'MEMBER_NOT_ACTIVE'> {
  constructor() {
    super('Member has been removed from the workspace', 'MEMBER_NOT_ACTIVE');
  }
}
