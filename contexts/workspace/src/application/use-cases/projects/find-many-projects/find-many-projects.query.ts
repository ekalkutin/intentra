import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type { ProjectDto } from '@intentra/contracts/workspace';
import { AccountId } from '@intentra/shared';

import {
  ProjectRepository,
  WorkspaceRepository,
} from '../../../ports/index.js';

export class FindManyProjectsQuery extends Query<ProjectDto[]> {
  constructor(public readonly accountId: string) {
    super();
  }
}

@QueryHandler(FindManyProjectsQuery)
export class FindManyProjectsQueryHandler implements IQueryHandler<FindManyProjectsQuery> {
  constructor(
    @Inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,

    @Inject(WorkspaceRepository)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  public async execute({
    accountId,
  }: FindManyProjectsQuery): Promise<ProjectDto[]> {
    const workspaces = await this.workspaceRepository.findByMember(
      new AccountId(accountId),
    );
    const projects = await this.projectRepository.findByWorkspaces(
      workspaces.map(workspace => workspace.id),
    );
    return projects.map(project => ({
      id: project.id.value,
      workspaceId: project.workspaceId.value,
      name: project.name,
      description: project.description,
    }));
  }
}
