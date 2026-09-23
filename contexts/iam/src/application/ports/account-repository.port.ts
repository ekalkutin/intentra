import type { Account } from '../../domain/entities/index.js';

export abstract class AccountRepository {
  abstract find(): Promise<Account[]>;
  abstract save(account: Account): Promise<void>;
}
