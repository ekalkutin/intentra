import { AccountId, Aggregate, EntityId, WorkspaceId } from '@intentra/shared';

export class MembershipId extends EntityId {
  declare private readonly __type: 'MembershipId';
}

export type CreateProps = {
  readonly workspaceId: string;
  readonly accountId: string;
};

export type ReconstituteProps = CreateProps & {
  readonly id: string;
  readonly joinedAt: Date;
};

/**
 * Принадлежность `Account` этому workspace.
 *
 * Отвечает на вопрос «он вообще наш?», а не «что ему можно» — права выдаются
 * отдельно, `RoleAssignment`. Состояния (приглашён, отключён) нет: приглашений
 * в MVP не существует, а отключать участника некому.
 */
export class Membership extends Aggregate<MembershipId> {
  readonly #workspaceId: WorkspaceId;
  readonly #accountId: AccountId;
  readonly #joinedAt: Date;

  private constructor(
    id: MembershipId,
    workspaceId: WorkspaceId,
    accountId: AccountId,
    joinedAt: Date,
  ) {
    super(id);
    this.#workspaceId = workspaceId;
    this.#accountId = accountId;
    this.#joinedAt = joinedAt;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get accountId(): AccountId {
    return this.#accountId;
  }

  get joinedAt(): Date {
    return this.#joinedAt;
  }

  public static create(props: CreateProps): Membership {
    return new Membership(
      new MembershipId(),
      new WorkspaceId(props.workspaceId),
      new AccountId(props.accountId),
      new Date(),
    );
  }

  public static reconstitute(props: ReconstituteProps): Membership {
    return new Membership(
      new MembershipId(props.id),
      new WorkspaceId(props.workspaceId),
      new AccountId(props.accountId),
      props.joinedAt,
    );
  }
}
