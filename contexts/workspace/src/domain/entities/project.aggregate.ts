import { Aggregate, ProjectId, WorkspaceId } from '@intentra/shared';

export type ProjectProps = {
  readonly workspaceId: WorkspaceId;
  readonly name: string;
  readonly description?: string;
};

export class Project extends Aggregate<ProjectId> {
  #workspaceId: WorkspaceId;
  #name: string;
  #description?: string;

  private constructor(id: ProjectId, props: ProjectProps) {
    super(id);
    this.#workspaceId = props.workspaceId;
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

  public static create(props: ProjectProps): Project {
    return new Project(new ProjectId(), props);
  }

  public static reconstitute(id: ProjectId, props: ProjectProps): Project {
    return new Project(id, props);
  }
}
