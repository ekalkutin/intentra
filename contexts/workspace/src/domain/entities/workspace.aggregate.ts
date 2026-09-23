import { Aggregate } from '@intentra/shared';

import { WorkspaceId } from '../value-objects/index.js';

export type WorkspaceCreateProps = {
  readonly name: string;
};

export class Workspace extends Aggregate<WorkspaceId> {
  #name: string;

  private constructor(id: WorkspaceId, name: string) {
    super(id);
    this.#name = name;
  }

  get name(): string {
    return this.#name;
  }

  static create(props: WorkspaceCreateProps): Workspace {
    const workspace = new Workspace(new WorkspaceId(), props.name);
    return workspace;
  }
  static reconstitute(id: WorkspaceId, props: WorkspaceCreateProps): Workspace {
    return new Workspace(id, props.name);
  }
}
