import { AccountId, Aggregate, Timestamp } from '@intentra/shared';

import {
  PersonalAccessTokenId,
  type PersonalAccessTokenName,
} from '../value-objects/index.js';

export type PersonalAccessTokenProps = {
  readonly accountId: AccountId;
  readonly name: PersonalAccessTokenName;
  /** Only the hash is kept: the secret itself is shown once, at creation. */
  readonly secretHash: string;
  readonly createdAt: Timestamp;
  readonly expiresAt: Timestamp | null;
  readonly revokedAt: Timestamp | null;
};

export type IssuePersonalAccessTokenProps = Pick<
  PersonalAccessTokenProps,
  'accountId' | 'name' | 'secretHash' | 'expiresAt'
>;

/** A long-lived secret an account gives an MCP agent to act on its behalf. */
export class PersonalAccessToken extends Aggregate<PersonalAccessTokenId> {
  readonly #accountId: AccountId;
  readonly #name: PersonalAccessTokenName;
  readonly #secretHash: string;
  readonly #createdAt: Timestamp;
  readonly #expiresAt: Timestamp | null;
  #revokedAt: Timestamp | null;

  private constructor(
    id: PersonalAccessTokenId,
    props: PersonalAccessTokenProps,
  ) {
    super(id);
    this.#accountId = props.accountId;
    this.#name = props.name;
    this.#secretHash = props.secretHash;
    this.#createdAt = props.createdAt;
    this.#expiresAt = props.expiresAt;
    this.#revokedAt = props.revokedAt;
  }

  get accountId(): AccountId {
    return this.#accountId;
  }

  get name(): PersonalAccessTokenName {
    return this.#name;
  }

  get secretHash(): string {
    return this.#secretHash;
  }

  get createdAt(): Timestamp {
    return this.#createdAt;
  }

  get expiresAt(): Timestamp | null {
    return this.#expiresAt;
  }

  get revokedAt(): Timestamp | null {
    return this.#revokedAt;
  }

  public isActive(now: Timestamp): boolean {
    if (this.#revokedAt) {
      return false;
    }
    return this.#expiresAt === null || now.isBefore(this.#expiresAt);
  }

  /** Idempotent: a revoked token keeps its first revocation time. */
  public revoke(now: Timestamp): void {
    this.#revokedAt ??= now;
  }

  public static issue(
    props: IssuePersonalAccessTokenProps,
    now: Timestamp,
  ): PersonalAccessToken {
    return new PersonalAccessToken(new PersonalAccessTokenId(), {
      ...props,
      createdAt: now,
      revokedAt: null,
    });
  }

  public static reconstitute(
    id: PersonalAccessTokenId,
    props: PersonalAccessTokenProps,
  ): PersonalAccessToken {
    return new PersonalAccessToken(id, props);
  }
}
