import { Inject, Injectable } from '@nestjs/common';

import type {
  CreateProjectDto,
  ProjectDto,
  ProjectsApi,
} from '@intentra/contracts/workspace';
import { WorkspaceId } from '@intentra/shared';

import { WorkspaceRepository } from '../../workspaces/application/workspace-repository.port.js';
import { Project } from '../domain/project.aggregate.js';

import { ProjectRepository } from './project-repository.port.js';
import { toProjectDto } from './project.mapper.js';
import { WorkspaceNotFoundError } from './workspace-not-found.error.js';

@Injectable()
export class ProjectsService implements ProjectsApi {
  constructor(
    @Inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,

    @Inject(WorkspaceRepository)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  public async create(data: CreateProjectDto): Promise<ProjectDto> {
    const workspaceId = new WorkspaceId(data.workspaceId);
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new WorkspaceNotFoundError(workspaceId);
    }

    const project = Project.create({
      workspaceId,
      name: data.name,
      description: data.description,
    });
    await this.projectRepository.save(project);
    return toProjectDto(project);
  }

  public async find(): Promise<ProjectDto[]> {
    const projects = await this.projectRepository.find();
    return projects.map(toProjectDto);
  }
}
