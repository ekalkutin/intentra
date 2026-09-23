import type { Account } from '../../domain/entities/index.js';

export abstract class AccountRepository {
  abstract find(): Promise<Account[]>;
}
