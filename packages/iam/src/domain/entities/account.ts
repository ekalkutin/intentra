import { AccountId, Aggregate } from '@intentra/shared-kernel';

import { Email } from '../value-objects/index.js';

export class Account extends Aggregate<AccountId> {
  #email: Email;
  #passwordHash: string;

  private constructor(id: AccountId, state: AccountState) {
    super(id);
    this.#email = state.email;
    this.#passwordHash = state.passwordHash;
  }

  get email(): Email {
    return this.#email;
  }

  get passwordHash(): string {
    return this.#passwordHash;
  }

  public static register(props: AccountRegisterProps): Account {
    const account = new Account(new AccountId(), {
      email: new Email(props.email),
      passwordHash: props.passwordHash,
    });

    return account;
  }
}

type AccountState = {
  readonly email: Email;
  readonly passwordHash: string;
};
type AccountRegisterProps = {
  readonly email: string;
  readonly passwordHash: string;
};
