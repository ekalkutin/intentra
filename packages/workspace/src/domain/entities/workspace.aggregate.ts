import { Aggregate, WorkspaceId } from '@intentra/shared-kernel';

import { WorkspaceName, WorkspaceSlug } from '../value-objects/index.js';

export class Workspace extends Aggregate<WorkspaceId> {
  readonly #name: WorkspaceName;
  readonly #slug: WorkspaceSlug;

  private constructor(id: WorkspaceId, state: WorkspaceState) {
    super(id);
    this.#name = state.name;
    this.#slug = state.slug;
  }

  get name(): WorkspaceName {
    return this.#name;
  }

  get slug(): WorkspaceSlug {
    return this.#slug;
  }

  public static create(props: WorkspaceCreateProps): Workspace {
    return new Workspace(new WorkspaceId(), {
      name: new WorkspaceName(props.name),
      slug: new WorkspaceSlug(props.slug),
    });
  }

  public static restore(props: WorkspaceRestoreProps): Workspace {
    return new Workspace(new WorkspaceId(props.id), {
      name: new WorkspaceName(props.name),
      slug: new WorkspaceSlug(props.slug),
    });
  }
}

type WorkspaceState = {
  readonly name: WorkspaceName;
  readonly slug: WorkspaceSlug;
};
type WorkspaceCreateProps = {
  readonly name: string;
  readonly slug: string;
};
type WorkspaceRestoreProps = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
};
