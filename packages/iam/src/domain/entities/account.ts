import {
  AccountId,
  Aggregate,
  Email,
  PersonName,
} from '@intentra/shared-kernel';

import {
  AccountBlockedException,
  PlatformAdminNotBlockableException,
} from '../exceptions/index.js';

export class Account extends Aggregate<AccountId> {
  #email: Email;
  #name: PersonName;
  #passwordHash: string;
  #isPlatformAdmin: boolean;
  #isBlocked: boolean;

  private constructor(id: AccountId, state: AccountState) {
    super(id);
    this.#email = state.email;
    this.#name = state.name;
    this.#passwordHash = state.passwordHash;
    this.#isPlatformAdmin = state.isPlatformAdmin;
    this.#isBlocked = state.isBlocked;
  }

  get email(): Email {
    return this.#email;
  }

  get name(): PersonName {
    return this.#name;
  }

  get passwordHash(): string {
    return this.#passwordHash;
  }

  /** Runs Intentra itself; gives no rights inside any Workspace. */
  get isPlatformAdmin(): boolean {
    return this.#isPlatformAdmin;
  }

  /** Blocked by a Platform Admin: it cannot sign in or refresh its session. */
  get isBlocked(): boolean {
    return this.#isBlocked;
  }

  public static register(props: AccountRegisterProps): Account {
    const account = new Account(new AccountId(), {
      email: new Email(props.email),
      name: new PersonName(props.name),
      passwordHash: props.passwordHash,
      isPlatformAdmin: false,
      isBlocked: false,
    });

    return account;
  }

  public static restore(props: AccountRestoreProps): Account {
    return new Account(new AccountId(props.id), {
      email: new Email(props.email),
      name: new PersonName(props.name),
      passwordHash: props.passwordHash,
      isPlatformAdmin: props.isPlatformAdmin,
      isBlocked: props.isBlocked,
    });
  }

  public rename(name: PersonName): void {
    this.#name = name;
  }

  /** A Platform Admin is never blocked, so appointing one unblocks it. */
  public appointPlatformAdmin(): void {
    this.#isPlatformAdmin = true;
    this.#isBlocked = false;
  }

  public dismissPlatformAdmin(): void {
    this.#isPlatformAdmin = false;
  }

  /** A Platform Admin is never blocked: the configuration decides who that is. */
  public block(): void {
    if (this.#isPlatformAdmin) {
      throw new PlatformAdminNotBlockableException();
    }
    this.#isBlocked = true;
  }

  public unblock(): void {
    this.#isBlocked = false;
  }

  public ensureNotBlocked(): void {
    if (this.#isBlocked) {
      throw new AccountBlockedException();
    }
  }
}

type AccountState = {
  readonly email: Email;
  readonly name: PersonName;
  readonly passwordHash: string;
  readonly isPlatformAdmin: boolean;
  readonly isBlocked: boolean;
};
type AccountRegisterProps = {
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string;
};
type AccountRestoreProps = {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly passwordHash: string;
  readonly isPlatformAdmin: boolean;
  readonly isBlocked: boolean;
};
