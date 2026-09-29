import { DomainException } from '@intentra/shared-kernel';

export class UnknownRoleException extends DomainException<'UNKNOWN_ROLE'> {
  constructor() {
    super('Role is not known', 'UNKNOWN_ROLE');
  }
}
