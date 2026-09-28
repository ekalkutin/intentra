import { AccountId, Aggregate } from '@intentra/shared-kernel';

import { Email } from '../value-objects/index.js';

export class Account extends Aggregate {
  #email: Email;
  #passwordHash: string;

  private constructor(id: AccountId, props: AccountProps) {
    super(id);
    this.#email = new Email(props.email);
    this.#passwordHash = props.passwordHash;
  }

  get email(): string {
    return this.#email.value;
  }

  get passwordHash(): string {
    return this.#passwordHash;
  }

  public static register(props: AccountRegisterProps): Account {
    const account = new Account(new AccountId(), props);

    return account;
  }
}

type AccountProps = {
  readonly email: string;
  readonly passwordHash: string;
};
type AccountRegisterProps = {
  readonly email: string;
  readonly passwordHash: string;
};
