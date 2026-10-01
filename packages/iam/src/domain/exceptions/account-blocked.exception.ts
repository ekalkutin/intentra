import { ForbiddenException } from '@intentra/shared-kernel';

export class AccountBlockedException extends ForbiddenException<'ACCOUNT_BLOCKED'> {
  constructor() {
    super('The account is blocked', 'ACCOUNT_BLOCKED');
  }
}
