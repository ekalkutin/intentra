import {
  AccountId,
  Aggregate,
  Email,
  PersonName,
  WorkspaceId,
} from '@intentra/shared-kernel';

import {
  AlreadyWorkspaceMemberException,
  MemberNotActiveException,
  MemberNotInWorkspaceException,
} from '../exceptions/index.js';
import { MemberId, MemberStatus, Role } from '../value-objects/index.js';

export class Member extends Aggregate<MemberId> {
  readonly #workspaceId: WorkspaceId;
  readonly #accountId: AccountId;
  readonly #email: Email;
  readonly #name: PersonName;
  #role: Role | null;
  #status: MemberStatus;

  private constructor(id: MemberId, state: MemberState) {
    super(id);
    this.#workspaceId = state.workspaceId;
    this.#accountId = state.accountId;
    this.#email = state.email;
    this.#name = state.name;
    this.#role = state.role;
    this.#status = state.status;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get accountId(): AccountId {
    return this.#accountId;
  }

  get email(): Email {
    return this.#email;
  }

  /** Its Account's name: read anew from IAM whenever the Member is read. */
  get name(): PersonName {
    return this.#name;
  }

  /** Null for a Member without a Role. */
  get role(): Role | null {
    return this.#role;
  }

  get status(): MemberStatus {
    return this.#status;
  }

  public static join(props: MemberJoinProps): Member {
    return new Member(new MemberId(), {
      workspaceId: new WorkspaceId(props.workspaceId),
      accountId: new AccountId(props.accountId),
      email: new Email(props.email),
      name: new PersonName(props.name),
      role: null,
      status: MemberStatus.Active,
    });
  }

  public static createOwner(props: MemberCreateOwnerProps): Member {
    return new Member(new MemberId(), {
      workspaceId: new WorkspaceId(props.workspaceId),
      accountId: new AccountId(props.accountId),
      email: new Email(props.email),
      name: new PersonName(props.name),
      role: Role.Owner,
      status: MemberStatus.Active,
    });
  }

  public static restore(props: MemberRestoreProps): Member {
    return new Member(new MemberId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      accountId: new AccountId(props.accountId),
      email: new Email(props.email),
      name: new PersonName(props.name),
      role: props.role === null ? null : Role.from(props.role),
      status: MemberStatus.from(props.status),
    });
  }

  public isActive(): boolean {
    return this.#status.equals(MemberStatus.Active);
  }

  public isOwner(): boolean {
    return this.#role?.equals(Role.Owner) ?? false;
  }

  public isManager(): boolean {
    return this.#role?.equals(Role.Manager) ?? false;
  }

  public belongsTo(workspaceId: WorkspaceId): boolean {
    return this.#workspaceId.equals(workspaceId);
  }

  /** Most acts in a Workspace are open only to its Active Members. */
  public ensureActiveIn(workspaceId: WorkspaceId): void {
    if (!this.belongsTo(workspaceId)) {
      throw new MemberNotInWorkspaceException();
    }
    if (!this.isActive()) {
      throw new MemberNotActiveException();
    }
  }

  /**
   * Checks that need the Workspace's other Members, such as keeping at least
   * one Owner, live in domain services, so go through them.
   */
  public changeRole(role: Role | null): void {
    this.#role = role;
  }

  /** A Removed Member keeps no Role. */
  public remove(): void {
    this.#status = MemberStatus.Removed;
    this.#role = null;
  }

  public rejoin(): void {
    if (this.isActive()) {
      throw new AlreadyWorkspaceMemberException();
    }
    this.#status = MemberStatus.Active;
  }
}

type MemberState = {
  readonly workspaceId: WorkspaceId;
  readonly accountId: AccountId;
  readonly email: Email;
  readonly name: PersonName;
  readonly role: Role | null;
  readonly status: MemberStatus;
};
type MemberJoinProps = {
  readonly workspaceId: string;
  readonly accountId: string;
  readonly email: string;
  readonly name: string;
};
type MemberCreateOwnerProps = {
  readonly workspaceId: string;
  readonly accountId: string;
  readonly email: string;
  readonly name: string;
};
type MemberRestoreProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly accountId: string;
  readonly email: string;
  /** Its Account's current name, read from IAM. */
  readonly name: string;
  readonly role: string | null;
  readonly status: string;
};
