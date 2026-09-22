import {
  AccountId,
  Aggregate,
  EntityId,
  Scope,
  WorkspaceId,
  type ScopeType,
} from '@intentra/shared';

import {
  isProjectRole,
  isWorkspaceRole,
  type Role,
} from '../value-objects/index.js';

export class RoleAssignmentId extends EntityId {
  declare private readonly __type: 'RoleAssignmentId';
}

export type CreateProps = {
  readonly workspaceId: string;
  readonly accountId: string;
  readonly role: Role;
  readonly scope: Scope;
};

export type ReconstituteProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly accountId: string;
  readonly role: Role;
  readonly scopeType: ScopeType;
  readonly scopeId: string | null;
};

/**
 * Выданное право в форме «кому, какая роль, на какой области».
 *
 * Права складываются и никогда не вычитаются: назначение может добавить
 * возможности, но не отнять то, что дано выше.
 */
export class RoleAssignment extends Aggregate<RoleAssignmentId> {
  readonly #workspaceId: WorkspaceId;
  readonly #accountId: AccountId;
  readonly #role: Role;
  readonly #scope: Scope;

  private constructor(
    id: RoleAssignmentId,
    workspaceId: WorkspaceId,
    accountId: AccountId,
    role: Role,
    scope: Scope,
  ) {
    super(id);

    /* Роль workspace на проекте и наоборот — не ошибка прав, а ошибка смысла:
       такое назначение невозможно истолковать, поэтому оно не создаётся. */
    if (scope.type === 'workspace' && !isWorkspaceRole(role)) {
      throw new Error(`Role "${role}" cannot be granted on a workspace`);
    }

    if (scope.type === 'project' && !isProjectRole(role)) {
      throw new Error(`Role "${role}" cannot be granted on a project`);
    }

    if (scope.type === 'platform') {
      throw new Error(
        'Platform authority is not a RoleAssignment: it lives in IAM as a PlatformRole',
      );
    }

    this.#workspaceId = workspaceId;
    this.#accountId = accountId;
    this.#role = role;
    this.#scope = scope;
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

  get scope(): Scope {
    return this.#scope;
  }

  public static create(props: CreateProps): RoleAssignment {
    return new RoleAssignment(
      new RoleAssignmentId(),
      new WorkspaceId(props.workspaceId),
      new AccountId(props.accountId),
      props.role,
      props.scope,
    );
  }

  public static reconstitute(props: ReconstituteProps): RoleAssignment {
    return new RoleAssignment(
      new RoleAssignmentId(props.id),
      new WorkspaceId(props.workspaceId),
      new AccountId(props.accountId),
      props.role,
      Scope.of(props.scopeType, props.scopeId),
    );
  }
}
