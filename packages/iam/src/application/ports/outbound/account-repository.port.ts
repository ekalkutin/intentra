import type { AccountId } from '@intentra/shared-kernel';

import { Account } from '../../../domain/entities/index.js';
import type { Email } from '../../../domain/value-objects/index.js';

export abstract class AccountRepository {
  abstract save(account: Account): Promise<void>;
  abstract findById(id: AccountId): Promise<Account | null>;
  abstract findByEmail(email: Email): Promise<Account | null>;
}
