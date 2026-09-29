import { Aggregate, WorkspaceId } from '@intentra/shared-kernel';

import {
  MemberId,
  WorkspaceName,
  WorkspaceSlug,
} from '../value-objects/index.js';

export class Workspace extends Aggregate<WorkspaceId> {
  #name: WorkspaceName;
  #ownerId: MemberId;

  readonly #slug: WorkspaceSlug;

  private constructor(id: WorkspaceId, state: WorkspaceState) {
    super(id);
    this.#name = state.name;
    this.#slug = state.slug;
    this.#ownerId = state.ownerId;
  }

  get name(): WorkspaceName {
    return this.#name;
  }

  get slug(): WorkspaceSlug {
    return this.#slug;
  }

  get ownerId(): MemberId {
    return this.#ownerId;
  }

  public static create(props: WorkspaceCreateProps): Workspace {
    return new Workspace(new WorkspaceId(), {
      name: new WorkspaceName(props.name),
      slug: new WorkspaceSlug(props.slug),
      ownerId: new MemberId(props.ownerId),
    });
  }

  public static restore(props: WorkspaceRestoreProps): Workspace {
    return new Workspace(new WorkspaceId(props.id), {
      name: new WorkspaceName(props.name),
      slug: new WorkspaceSlug(props.slug),
      ownerId: new MemberId(props.ownerId),
    });
  }

  public rename(name: string): void {
    this.#name = new WorkspaceName(name);
  }

  public isOwnedBy(memberId: MemberId): boolean {
    return this.#ownerId.equals(memberId);
  }

  /**
   * Only moves the reference. Checks that need the new Owner's Member live in
   * `OwnershipTransferService`, so go through it rather than calling this directly.
   */
  public transferOwnership(newOwnerId: MemberId): void {
    this.#ownerId = newOwnerId;
  }
}

type WorkspaceState = {
  readonly name: WorkspaceName;
  readonly slug: WorkspaceSlug;
  readonly ownerId: MemberId;
};
type WorkspaceCreateProps = {
  readonly name: string;
  readonly slug: string;
  readonly ownerId: string;
};
type WorkspaceRestoreProps = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly ownerId: string;
};
