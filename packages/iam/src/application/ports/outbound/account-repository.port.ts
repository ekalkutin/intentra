import type { AccountId, Email } from '@intentra/shared-kernel';

import { Account } from '../../../domain/entities/index.js';
import { AccountNotFoundException } from '../../exceptions/index.js';

export type AccountQueryProps =
  { readonly id: AccountId } | { readonly email: Email };

export type AccountListProps = {
  readonly isPlatformAdmin: boolean;
};

export abstract class AccountRepository {
  abstract save(account: Account): Promise<void>;
  abstract findOne(props: AccountQueryProps): Promise<Account | null>;
  abstract findMany(props: AccountListProps): Promise<Account[]>;

  public async getOne(props: AccountQueryProps): Promise<Account> {
    const account = await this.findOne(props);
    if (!account) {
      throw new AccountNotFoundException();
    }

    return account;
  }
}
