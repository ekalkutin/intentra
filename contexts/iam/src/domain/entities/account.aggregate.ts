import { AccountId, Aggregate } from '@intentra/shared';

import type { DisplayName, Email } from '../value-objects/index.js';

export type AccountProps = {
  readonly email: Email;
  readonly passwordHash: string;
  /** `null`: not set yet; the email stands in for it. */
  readonly displayName: DisplayName | null;
};

export type SignUpAccountProps = Pick<AccountProps, 'email' | 'passwordHash'>;

export class Account extends Aggregate<AccountId> {
  readonly #email: Email;
  #passwordHash: string;
  #displayName: DisplayName | null;

  private constructor(id: AccountId, props: AccountProps) {
    super(id);
    this.#email = props.email;
    this.#passwordHash = props.passwordHash;
    this.#displayName = props.displayName;
  }

  get email(): Email {
    return this.#email;
  }

  get passwordHash(): string {
    return this.#passwordHash;
  }

  get displayName(): DisplayName | null {
    return this.#displayName;
  }

  public rename(displayName: DisplayName | null): void {
    this.#displayName = displayName;
  }

  public changePassword(passwordHash: string): void {
    this.#passwordHash = passwordHash;
  }

  public static signUp(props: SignUpAccountProps): Account {
    return new Account(new AccountId(), { ...props, displayName: null });
  }

  public static reconstitute(id: AccountId, props: AccountProps): Account {
    return new Account(id, props);
  }
}
