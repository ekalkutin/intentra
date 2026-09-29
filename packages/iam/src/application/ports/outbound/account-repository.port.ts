import type { AccountId } from '@intentra/shared-kernel';

import { Account } from '../../../domain/entities/index.js';
import type { Email } from '../../../domain/value-objects/index.js';

export type AccountQueryProps =
  { readonly id: AccountId } | { readonly email: Email };

export abstract class AccountRepository {
  abstract save(account: Account): Promise<void>;
  abstract findOne(props: AccountQueryProps): Promise<Account | null>;
}
