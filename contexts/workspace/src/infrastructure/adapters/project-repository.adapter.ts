import { Inject, Injectable } from '@nestjs/common';

import { ProjectId, WorkspaceId } from '@intentra/shared';

import { ProjectRepository } from '../../application/ports/project-repository.port.js';
import { Project } from '../../domain/project/project.aggregate.js';
import { WorkspaceDatabase } from '../database/workspace-database.js';

type ProjectRow = {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly description: string | null;
};

@Injectable()
export class ProjectRepositoryAdapter extends ProjectRepository {
  constructor(
    @Inject(WorkspaceDatabase)
    private readonly database: WorkspaceDatabase,
  ) {
    super();
  }

  public async save(project: Project): Promise<void> {
    await this.database.orm.public.Project.create({
      id: project.id.value,
      workspaceId: project.workspaceId.value,
      name: project.name,
      description: project.description ?? null,
    });
  }

  public async find(): Promise<Project[]> {
    const projects = await this.database.orm.public.Project.all();
    return projects.map(project => this.toDomain(project));
  }

  private toDomain(project: ProjectRow): Project {
    return Project.reconstitute(new ProjectId(project.id), {
      workspaceId: new WorkspaceId(project.workspaceId),
      name: project.name,
      description: project.description ?? undefined,
    });
  }
}
