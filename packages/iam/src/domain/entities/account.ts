import { AccountId, Aggregate, Email } from '@intentra/shared-kernel';

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

  public static restore(props: AccountRestoreProps): Account {
    return new Account(new AccountId(props.id), {
      email: new Email(props.email),
      passwordHash: props.passwordHash,
    });
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
type AccountRestoreProps = {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
};
