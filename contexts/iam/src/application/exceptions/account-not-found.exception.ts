import { NotFoundException } from '@intentra/shared';

export class AccountNotFoundException extends NotFoundException<'ACCOUNT_NOT_FOUND'> {
  constructor(accountId: string) {
    super(`Account ${accountId} not found`, 'ACCOUNT_NOT_FOUND');
  }
}
