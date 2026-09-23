import { Aggregate } from '@intentra/shared';

import { AccountId } from '../value-objects/index.js';

export class Account extends Aggregate<AccountId> {
  constructor(
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
}
