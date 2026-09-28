import { Account } from '../../../domain/entities/index.js';

export abstract class AccountRepository {
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract save(account: Account): Promise<void>;
}
