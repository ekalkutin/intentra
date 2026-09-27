import type { Account } from '../../domain/account/account.aggregate.js';

export abstract class AccountRepository {
  abstract find(): Promise<Account[]>;
  abstract save(account: Account): Promise<void>;
}
