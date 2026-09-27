import { Aggregate } from '@intentra/shared';

import { AccountId } from '../value-objects/account-id.vo.js';

export type AccountProps = {
  readonly email: string;
  readonly password: string;
};

export class Account extends Aggregate<AccountId> {
  private constructor(
    id: AccountId,
    public readonly email: string,
    public readonly password: string,
  ) {
    super(id);
  }

  public static signUp(email: string, passwordHash: string): Account {
    return new Account(new AccountId(), email, passwordHash);
  }

  public static reconstitute(id: AccountId, props: AccountProps): Account {
    return new Account(id, props.email, props.password);
  }
}
