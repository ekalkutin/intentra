import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type { ProjectDto } from '@intentra/contracts/workspace';
import { ProjectId } from '@intentra/shared';

import { ProjectRepository } from '../../../ports/index.js';

export class GetOneProjectQuery extends Query<ProjectDto> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(GetOneProjectQuery)
export class GetOneProjectQueryHandler implements IQueryHandler<GetOneProjectQuery> {
  constructor(
    @Inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  public async execute({ id }: GetOneProjectQuery): Promise<ProjectDto> {
    const project = await this.projectRepository.getById(new ProjectId(id));
    return {
      id: project.id.value,
      workspaceId: project.workspaceId.value,
      name: project.name,
      description: project.description,
    };
  }
}
