import { Aggregate, ProjectId, WorkspaceId } from '@intentra/shared';

import { ProjectCreatedEvent } from '../events/index.js';
import { ProjectName } from '../value-objects/project-name.vo.js';

export type CreateProps = {
  readonly workspaceId: string;
  readonly name: string;
};

export type ReconstituteProps = CreateProps & {
  readonly id: string;
  readonly createdAt: Date;
};

/**
 * Единица работы: свой домен, свой язык, свои артефакты.
 *
 * Лежит ровно в одном workspace, и это не меняется: перенос проекта между
 * тенантами означал бы перенос всего, что на него ссылается, — до первого
 * запроса такой возможности её нет.
 */
export class Project extends Aggregate<ProjectId> {
  readonly #workspaceId: WorkspaceId;
  #name: ProjectName;
  readonly #createdAt: Date;

  private constructor(
    id: ProjectId,
    workspaceId: WorkspaceId,
    name: ProjectName,
    createdAt: Date,
  ) {
    super(id);
    this.#workspaceId = workspaceId;
    this.#name = name;
    this.#createdAt = createdAt;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get name(): string {
    return this.#name.value;
  }

  get createdAt(): Date {
    return this.#createdAt;
  }

  public rename(name: string): void {
    this.#name = new ProjectName(name);
  }

  public static create(props: CreateProps): Project {
    const project = new Project(
      new ProjectId(),
      new WorkspaceId(props.workspaceId),
      new ProjectName(props.name),
      new Date(),
    );

    project.apply(
      new ProjectCreatedEvent(
        project.id.toString(),
        project.workspaceId.toString(),
        project.name,
      ),
    );

    return project;
  }

  public static reconstitute(props: ReconstituteProps): Project {
    return new Project(
      new ProjectId(props.id),
      new WorkspaceId(props.workspaceId),
      new ProjectName(props.name),
      props.createdAt,
    );
  }
}
