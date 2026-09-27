import type { AccountId } from '@intentra/shared';

import type { Account } from '../../domain/entities/index.js';
import type { Email } from '../../domain/value-objects/index.js';
import { AccountNotFoundException } from '../exceptions/index.js';

export abstract class AccountRepository {
  abstract save(account: Account): Promise<void>;
  abstract findById(id: AccountId): Promise<Account | null>;
  abstract findByEmail(email: Email): Promise<Account | null>;

  public async getById(id: AccountId): Promise<Account> {
    const account = await this.findById(id);
    if (!account) {
      throw new AccountNotFoundException(id.value);
    }
    return account;
  }
}
