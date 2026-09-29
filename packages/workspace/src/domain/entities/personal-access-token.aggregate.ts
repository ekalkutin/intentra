import { Aggregate, WorkspaceId } from '@intentra/shared-kernel';

import {
  MemberId,
  PersonalAccessTokenId,
  PersonalAccessTokenLifetime,
  PersonalAccessTokenName,
  PersonalAccessTokenSecretHash,
  PersonalAccessTokenSecretHint,
  ProjectRole,
} from '../value-objects/index.js';

/**
 * Lets an external agent work in the Workspace on its Member's behalf. Its
 * level is named like a Project Role and caps what the agent may do.
 */
export class PersonalAccessToken extends Aggregate<PersonalAccessTokenId> {
  readonly #workspaceId: WorkspaceId;
  readonly #memberId: MemberId;
  readonly #name: PersonalAccessTokenName;
  readonly #level: ProjectRole;
  readonly #secretHash: PersonalAccessTokenSecretHash;
  readonly #secretHint: PersonalAccessTokenSecretHint;
  readonly #createdAt: Temporal.Instant;
  readonly #expiresAt: Temporal.Instant | null;
  #lastUsedAt: Temporal.Instant | null;

  private constructor(
    id: PersonalAccessTokenId,
    state: PersonalAccessTokenState,
  ) {
    super(id);
    this.#workspaceId = state.workspaceId;
    this.#memberId = state.memberId;
    this.#name = state.name;
    this.#level = state.level;
    this.#secretHash = state.secretHash;
    this.#secretHint = state.secretHint;
    this.#createdAt = state.createdAt;
    this.#expiresAt = state.expiresAt;
    this.#lastUsedAt = state.lastUsedAt;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get memberId(): MemberId {
    return this.#memberId;
  }

  get name(): PersonalAccessTokenName {
    return this.#name;
  }

  get level(): ProjectRole {
    return this.#level;
  }

  get secretHash(): PersonalAccessTokenSecretHash {
    return this.#secretHash;
  }

  get secretHint(): PersonalAccessTokenSecretHint {
    return this.#secretHint;
  }

  get createdAt(): Temporal.Instant {
    return this.#createdAt;
  }

  /** Null for a token that never expires. */
  get expiresAt(): Temporal.Instant | null {
    return this.#expiresAt;
  }

  /** Null until an agent first uses the token. */
  get lastUsedAt(): Temporal.Instant | null {
    return this.#lastUsedAt;
  }

  public static create(
    props: PersonalAccessTokenCreateProps,
  ): PersonalAccessToken {
    const now = Temporal.Now.instant();

    return new PersonalAccessToken(new PersonalAccessTokenId(), {
      workspaceId: new WorkspaceId(props.workspaceId),
      memberId: new MemberId(props.memberId),
      name: new PersonalAccessTokenName(props.name),
      level: ProjectRole.from(props.level),
      secretHash: new PersonalAccessTokenSecretHash(props.secretHash),
      secretHint: new PersonalAccessTokenSecretHint(props.secretHint),
      createdAt: now,
      expiresAt: PersonalAccessTokenLifetime.fromDays(
        props.lifetimeDays,
      ).expiresAt(now),
      lastUsedAt: null,
    });
  }

  public static restore(
    props: PersonalAccessTokenRestoreProps,
  ): PersonalAccessToken {
    return new PersonalAccessToken(new PersonalAccessTokenId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      memberId: new MemberId(props.memberId),
      name: new PersonalAccessTokenName(props.name),
      level: ProjectRole.from(props.level),
      secretHash: new PersonalAccessTokenSecretHash(props.secretHash),
      secretHint: new PersonalAccessTokenSecretHint(props.secretHint),
      createdAt: props.createdAt,
      expiresAt: props.expiresAt,
      lastUsedAt: props.lastUsedAt,
    });
  }

  public isExpired(): boolean {
    return (
      this.#expiresAt !== null &&
      Temporal.Instant.compare(Temporal.Now.instant(), this.#expiresAt) >= 0
    );
  }

  public isCreatedBy(memberId: MemberId): boolean {
    return this.#memberId.equals(memberId);
  }

  public markUsed(): void {
    this.#lastUsedAt = Temporal.Now.instant();
  }
}

type PersonalAccessTokenState = {
  readonly workspaceId: WorkspaceId;
  readonly memberId: MemberId;
  readonly name: PersonalAccessTokenName;
  readonly level: ProjectRole;
  readonly secretHash: PersonalAccessTokenSecretHash;
  readonly secretHint: PersonalAccessTokenSecretHint;
  readonly createdAt: Temporal.Instant;
  readonly expiresAt: Temporal.Instant | null;
  readonly lastUsedAt: Temporal.Instant | null;
};
type PersonalAccessTokenCreateProps = {
  readonly workspaceId: string;
  readonly memberId: string;
  readonly name: string;
  readonly level: string;
  readonly secretHash: string;
  readonly secretHint: string;
  /** Null for a token that never expires. */
  readonly lifetimeDays: number | null;
};
type PersonalAccessTokenRestoreProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly memberId: string;
  readonly name: string;
  readonly level: string;
  readonly secretHash: string;
  readonly secretHint: string;
  readonly createdAt: Temporal.Instant;
  readonly expiresAt: Temporal.Instant | null;
  readonly lastUsedAt: Temporal.Instant | null;
};
