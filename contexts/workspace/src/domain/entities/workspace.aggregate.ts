import { AccountId, Aggregate, WorkspaceId } from '@intentra/shared';

import type { WorkspaceAlias } from '../value-objects/index.js';

export type WorkspaceProps = {
  readonly name: string;
  readonly alias: WorkspaceAlias;
  readonly members: readonly AccountId[];
};

export type CreateWorkspaceProps = {
  readonly name: string;
  readonly alias: WorkspaceAlias;
  /** Becomes the first member. */
  readonly creator: AccountId;
};

/** Only its members can see or change it. */
export class Workspace extends Aggregate<WorkspaceId> {
  #name: string;
  readonly #alias: WorkspaceAlias;
  readonly #members: AccountId[];

  private constructor(id: WorkspaceId, props: WorkspaceProps) {
    super(id);
    this.#name = props.name;
    this.#alias = props.alias;
    this.#members = [...props.members];
  }

  get name(): string {
    return this.#name;
  }

  get alias(): WorkspaceAlias {
    return this.#alias;
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
      alias: props.alias,
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
