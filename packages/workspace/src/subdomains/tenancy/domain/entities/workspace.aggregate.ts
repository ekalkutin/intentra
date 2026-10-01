import { Aggregate, WorkspaceId } from '@intentra/shared-kernel';

import { WorkspaceSuspendedException } from '../exceptions/index.js';
import { WorkspaceName, WorkspaceSlug } from '../value-objects/index.js';

export class Workspace extends Aggregate<WorkspaceId> {
  readonly #name: WorkspaceName;
  readonly #slug: WorkspaceSlug;
  #suspended: boolean;

  private constructor(id: WorkspaceId, state: WorkspaceState) {
    super(id);
    this.#name = state.name;
    this.#slug = state.slug;
    this.#suspended = state.suspended;
  }

  get name(): WorkspaceName {
    return this.#name;
  }

  get slug(): WorkspaceSlug {
    return this.#slug;
  }

  /** Suspended by a Platform Admin: nothing in it can be changed, and no AI works with it. */
  get isSuspended(): boolean {
    return this.#suspended;
  }

  public static create(props: WorkspaceCreateProps): Workspace {
    return new Workspace(new WorkspaceId(), {
      name: new WorkspaceName(props.name),
      slug: new WorkspaceSlug(props.slug),
      suspended: false,
    });
  }

  public static restore(props: WorkspaceRestoreProps): Workspace {
    return new Workspace(new WorkspaceId(props.id), {
      name: new WorkspaceName(props.name),
      slug: new WorkspaceSlug(props.slug),
      suspended: props.suspended,
    });
  }

  public suspend(): void {
    this.#suspended = true;
  }

  public resume(): void {
    this.#suspended = false;
  }

  /** Anything that changes what is in the Workspace asks this first. */
  public ensureChangeable(): void {
    if (this.#suspended) {
      throw new WorkspaceSuspendedException();
    }
  }
}

type WorkspaceState = {
  readonly name: WorkspaceName;
  readonly slug: WorkspaceSlug;
  readonly suspended: boolean;
};
type WorkspaceCreateProps = {
  readonly name: string;
  readonly slug: string;
};
type WorkspaceRestoreProps = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly suspended: boolean;
};
