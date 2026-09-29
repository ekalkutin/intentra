import {
  AccountId,
  Aggregate,
  Email,
  WorkspaceId,
} from '@intentra/shared-kernel';

import { AlreadyWorkspaceMemberException } from '../exceptions/index.js';
import { MemberId, MemberStatus, Role } from '../value-objects/index.js';

export class Member extends Aggregate<MemberId> {
  readonly #workspaceId: WorkspaceId;
  readonly #accountId: AccountId;
  readonly #email: Email;
  #role: Role;
  #status: MemberStatus;

  private constructor(id: MemberId, state: MemberState) {
    super(id);
    this.#workspaceId = state.workspaceId;
    this.#accountId = state.accountId;
    this.#email = state.email;
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

  get role(): Role {
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
      role: Role.Contributor,
      status: MemberStatus.Active,
    });
  }

  public static createOwner(props: MemberCreateOwnerProps): Member {
    return new Member(new MemberId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      accountId: new AccountId(props.accountId),
      email: new Email(props.email),
      role: Role.Contributor,
      status: MemberStatus.Active,
    });
  }

  public static restore(props: MemberRestoreProps): Member {
    return new Member(new MemberId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      accountId: new AccountId(props.accountId),
      email: new Email(props.email),
      role: Role.from(props.role),
      status: MemberStatus.from(props.status),
    });
  }

  public isActive(): boolean {
    return this.#status.equals(MemberStatus.Active);
  }

  public belongsTo(workspaceId: WorkspaceId): boolean {
    return this.#workspaceId.equals(workspaceId);
  }

  public remove(): void {
    this.#status = MemberStatus.Removed;
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
  readonly role: Role;
  readonly status: MemberStatus;
};
type MemberJoinProps = {
  readonly workspaceId: string;
  readonly accountId: string;
  readonly email: string;
};
type MemberCreateOwnerProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly accountId: string;
  readonly email: string;
};
type MemberRestoreProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly accountId: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
};
