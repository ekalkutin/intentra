import { AccountId, Aggregate, WorkspaceId } from '@intentra/shared';

export type WorkspaceProps = {
  readonly name: string;
  readonly members: readonly AccountId[];
};

export type CreateWorkspaceProps = {
  readonly name: string;
  /** Becomes the first member. */
  readonly creator: AccountId;
};

/** Only its members can see or change it. */
export class Workspace extends Aggregate<WorkspaceId> {
  #name: string;
  readonly #members: AccountId[];

  private constructor(id: WorkspaceId, props: WorkspaceProps) {
    super(id);
    this.#name = props.name;
    this.#members = [...props.members];
  }

  get name(): string {
    return this.#name;
  }

  get members(): readonly AccountId[] {
    return [...this.#members];
  }

  public hasMember(accountId: AccountId): boolean {
    return this.#members.some(member => member.equals(accountId));
  }

  public static create(props: CreateWorkspaceProps): Workspace {
    return new Workspace(new WorkspaceId(), {
      name: props.name,
      members: [props.creator],
    });
  }

  public static reconstitute(
    id: WorkspaceId,
    props: WorkspaceProps,
  ): Workspace {
    return new Workspace(id, props);
  }
}
