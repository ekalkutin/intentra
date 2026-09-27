import { Inject, Injectable } from '@nestjs/common';

import type {
  CreateProjectDto,
  ProjectDto,
  ProjectsApi,
} from '@intentra/contracts/workspace';
import { WorkspaceId } from '@intentra/shared';

import { Project } from '../../domain/entities/project.aggregate.js';
import { WorkspaceNotFoundError } from '../errors/workspace-not-found.error.js';
import { toProjectDto } from '../mappers/project.mapper.js';
import { ProjectRepository } from '../ports/project-repository.port.js';
import { WorkspaceRepository } from '../ports/workspace-repository.port.js';

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
