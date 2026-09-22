import { AccountId, Aggregate } from '@intentra/shared';

import { AccountRegisteredEvent } from '../events/index.js';
import { Email } from '../value-objects/index.js';

export type RegisterProps = {
  readonly email: string;
  /** Уже посчитанный хеш: домен не знает, чем именно пароль превращён в него. */
  readonly passwordHash: string;
};

export type ReconstituteProps = RegisterProps & {
  readonly id: string;
};

/**
 * Человек как субъект платформы, единый для всех workspace.
 *
 * Состояния у него нет: заблокировать `Account` в MVP нечем и незачем — такого
 * действия нет ни у кого. Появится блокировка — появится и поле, и вместе с ним
 * отзыв `RefreshToken`.
 */
export class Account extends Aggregate<AccountId> {
  #email: Email;
  #passwordHash: string;

  private constructor(id: AccountId, email: Email, passwordHash: string) {
    super(id);
    this.#email = email;
    this.#passwordHash = passwordHash;
  }

  get email(): string {
    return this.#email.value;
  }

  /** Хеш, с которым сверяется предъявленный пароль. Само значение пароля не хранится нигде. */
  get passwordHash(): string {
    return this.#passwordHash;
  }

  public changePassword(passwordHash: string): void {
    this.#passwordHash = passwordHash;
  }

  public static register(props: RegisterProps): Account {
    const account = new Account(
      new AccountId(),
      new Email(props.email),
      props.passwordHash,
    );

    account.apply(
      new AccountRegisteredEvent(account.id.toString(), account.email),
    );

    return account;
  }

  public static reconstitute(props: ReconstituteProps): Account {
    return new Account(
      new AccountId(props.id),
      new Email(props.email),
      props.passwordHash,
    );
  }
}
