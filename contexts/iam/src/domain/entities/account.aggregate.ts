import { AccountId, Aggregate } from '@intentra/shared';

import type { Email } from '../value-objects/index.js';

export type AccountProps = {
  readonly email: Email;
  readonly passwordHash: string;
};

export class Account extends Aggregate<AccountId> {
  private constructor(
    id: AccountId,
    public readonly email: Email,
    public readonly passwordHash: string,
  ) {
    super(id);
  }

  public static signUp(props: AccountProps): Account {
    return new Account(new AccountId(), props.email, props.passwordHash);
  }

  public static reconstitute(id: AccountId, props: AccountProps): Account {
    return new Account(id, props.email, props.passwordHash);
  }
}
