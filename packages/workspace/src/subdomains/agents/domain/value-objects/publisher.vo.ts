import type { AccountId, Email } from '@intentra/shared-kernel';

/** The Platform Admin who published an Agents Version, with a copy of their email. */
export class Publisher {
  readonly #accountId: AccountId;
  readonly #email: Email;

  constructor(accountId: AccountId, email: Email) {
    this.#accountId = accountId;
    this.#email = email;
  }

  public get accountId(): AccountId {
    return this.#accountId;
  }

  public get email(): Email {
    return this.#email;
  }
}
