import { Inject, Injectable } from '@nestjs/common';

import {
  type CreateProjectDto,
  type ProjectDto,
  type ProjectsApi,
} from '@intentra/contracts/workspace';
import { AccountId, WorkspaceId } from '@intentra/shared';

import { Project } from '../../domain/entities/index.js';
import { WorkspaceNotFoundException } from '../exceptions/index.js';
import { toProjectDto } from '../mappers/index.js';
import { ProjectRepository, WorkspaceRepository } from '../ports/index.js';

@Injectable()
export class ProjectsService implements ProjectsApi {
  constructor(
    @Inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,

    @Inject(WorkspaceRepository)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  public async create(
    accountId: string,
    data: CreateProjectDto,
  ): Promise<ProjectDto> {
    const workspaceId = new WorkspaceId(data.workspaceId);
    const workspace = await this.workspaceRepository.getById(workspaceId);
    // Not a member: the workspace does not exist for this account.
    if (!workspace.hasMember(new AccountId(accountId))) {
      throw new WorkspaceNotFoundException(workspaceId.value);
    }

    const project = Project.create({
      workspaceId,
      name: data.name,
      description: data.description,
    });
    await this.projectRepository.save(project);
    return toProjectDto(project);
  }

  public async find(accountId: string): Promise<ProjectDto[]> {
    const workspaces = await this.workspaceRepository.findByMember(
      new AccountId(accountId),
    );
    const projects = await this.projectRepository.findByWorkspaces(
      workspaces.map(workspace => workspace.id),
    );
    return projects.map(toProjectDto);
  }
}
