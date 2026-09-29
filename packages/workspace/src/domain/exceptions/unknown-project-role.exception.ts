import { DomainException } from '@intentra/shared-kernel';

export class UnknownProjectRoleException extends DomainException<'UNKNOWN_PROJECT_ROLE'> {
  constructor() {
    super('Project role is not known', 'UNKNOWN_PROJECT_ROLE');
  }
}
