import { Aggregate, ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId, ProjectName, ProjectSlug } from '../value-objects/index.js';

export class Project extends Aggregate<ProjectId> {
  readonly #workspaceId: WorkspaceId;
  readonly #name: ProjectName;
  readonly #slug: ProjectSlug;
  readonly #createdBy: MemberId;

  private constructor(id: ProjectId, state: ProjectState) {
    super(id);
    this.#workspaceId = state.workspaceId;
    this.#name = state.name;
    this.#slug = state.slug;
    this.#createdBy = state.createdBy;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get name(): ProjectName {
    return this.#name;
  }

  get slug(): ProjectSlug {
    return this.#slug;
  }

  get createdBy(): MemberId {
    return this.#createdBy;
  }

  public static create(props: ProjectCreateProps): Project {
    return new Project(new ProjectId(), {
      workspaceId: new WorkspaceId(props.workspaceId),
      name: new ProjectName(props.name),
      slug: new ProjectSlug(props.slug),
      createdBy: new MemberId(props.createdBy),
    });
  }

  public static restore(props: ProjectRestoreProps): Project {
    return new Project(new ProjectId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      name: new ProjectName(props.name),
      slug: new ProjectSlug(props.slug),
      createdBy: new MemberId(props.createdBy),
    });
  }
}

type ProjectState = {
  readonly workspaceId: WorkspaceId;
  readonly name: ProjectName;
  readonly slug: ProjectSlug;
  readonly createdBy: MemberId;
};
type ProjectCreateProps = {
  readonly workspaceId: string;
  readonly name: string;
  readonly slug: string;
  readonly createdBy: string;
};
type ProjectRestoreProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly slug: string;
  readonly createdBy: string;
};
