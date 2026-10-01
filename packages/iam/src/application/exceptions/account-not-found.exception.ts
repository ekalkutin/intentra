import { NotFoundException } from '@intentra/shared-kernel';

export class AccountNotFoundException extends NotFoundException<'ACCOUNT_NOT_FOUND'> {
  constructor() {
    super('Account not found', 'ACCOUNT_NOT_FOUND');
  }
}
