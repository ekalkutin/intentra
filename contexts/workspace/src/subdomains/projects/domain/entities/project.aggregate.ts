import { Aggregate } from '@intentra/shared';

import { WorkspaceId } from '../../../../domain/value-objects/index.js';
import { ProjectId } from '../value-objects/index.js';

export type ProjectCreateProps = {
  readonly workspaceId: string;
  readonly name: string;
  readonly description?: string;
};

export type ReconstituteProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly description?: string;
};

export class Project extends Aggregate<ProjectId> {
  #workspaceId: WorkspaceId;
  #name: string;
  #description?: string;
  private constructor(id: ProjectId, props: ProjectCreateProps) {
    super(id);
    this.#workspaceId = new WorkspaceId(props.workspaceId);
    this.#name = props.name;
    this.#description = props.description;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get name(): string {
    return this.#name;
  }

  get description(): string | undefined {
    return this.#description;
  }

  public static create(props: ProjectCreateProps): Project {
    return new Project(new ProjectId(), props);
  }

  public static reconstitute(props: ReconstituteProps): Project {
    return new Project(new ProjectId(props.id), props);
  }
}
