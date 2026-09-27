import type { Account } from '../../domain/entities/account.aggregate.js';

export abstract class AccountRepository {
  abstract find(): Promise<Account[]>;
  abstract save(account: Account): Promise<void>;
}
