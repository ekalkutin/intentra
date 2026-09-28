import { AccountId, Aggregate, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId, MemberStatus, Role } from '../value-objects/index.js';

export class Member extends Aggregate<MemberId> {
  readonly #workspaceId: WorkspaceId;
  readonly #accountId: AccountId;
  #role: Role;
  #status: MemberStatus;

  private constructor(id: MemberId, state: MemberState) {
    super(id);
    this.#workspaceId = state.workspaceId;
    this.#accountId = state.accountId;
    this.#role = state.role;
    this.#status = state.status;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get accountId(): AccountId {
    return this.#accountId;
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
      role: Role.Contributor,
      status: MemberStatus.Active,
    });
  }

  public static createOwner(props: MemberCreateOwnerProps): Member {
    return new Member(new MemberId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      accountId: new AccountId(props.accountId),
      role: Role.Contributor,
      status: MemberStatus.Active,
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
}

type MemberState = {
  readonly workspaceId: WorkspaceId;
  readonly accountId: AccountId;
  readonly role: Role;
  readonly status: MemberStatus;
};
type MemberJoinProps = {
  readonly workspaceId: string;
  readonly accountId: string;
};
type MemberCreateOwnerProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly accountId: string;
};
