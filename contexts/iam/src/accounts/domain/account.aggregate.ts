import { Aggregate } from '@intentra/shared';

import { AccountId } from './account-id.vo.js';

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

  public static signUp(email: string, password: string): Account {
    const account = new Account(new AccountId(), email, password);
    // You might want to handle the password here, e.g., hashing it and storing it securely.
    return account;
  }

  public static reconstitute(id: AccountId, props: AccountProps): Account {
    return new Account(id, props.email, props.password);
  }
}
