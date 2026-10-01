import { AccountId, Aggregate, Email } from '@intentra/shared-kernel';

export class Account extends Aggregate<AccountId> {
  #email: Email;
  #passwordHash: string;
  #isPlatformAdmin: boolean;

  private constructor(id: AccountId, state: AccountState) {
    super(id);
    this.#email = state.email;
    this.#passwordHash = state.passwordHash;
    this.#isPlatformAdmin = state.isPlatformAdmin;
  }

  get email(): Email {
    return this.#email;
  }

  get passwordHash(): string {
    return this.#passwordHash;
  }

  /** Runs Intentra itself; gives no rights inside any Workspace. */
  get isPlatformAdmin(): boolean {
    return this.#isPlatformAdmin;
  }

  public static register(props: AccountRegisterProps): Account {
    const account = new Account(new AccountId(), {
      email: new Email(props.email),
      passwordHash: props.passwordHash,
      isPlatformAdmin: false,
    });

    return account;
  }

  public static restore(props: AccountRestoreProps): Account {
    return new Account(new AccountId(props.id), {
      email: new Email(props.email),
      passwordHash: props.passwordHash,
      isPlatformAdmin: props.isPlatformAdmin,
    });
  }

  public appointPlatformAdmin(): void {
    this.#isPlatformAdmin = true;
  }

  public dismissPlatformAdmin(): void {
    this.#isPlatformAdmin = false;
  }
}

type AccountState = {
  readonly email: Email;
  readonly passwordHash: string;
  readonly isPlatformAdmin: boolean;
};
type AccountRegisterProps = {
  readonly email: string;
  readonly passwordHash: string;
};
type AccountRestoreProps = {
  readonly id: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly isPlatformAdmin: boolean;
};
