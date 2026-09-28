import { Account } from '../../../domain/entities/index.js';

export abstract class AccountRepository {
  abstract save(account: Account): Promise<void>;
}
