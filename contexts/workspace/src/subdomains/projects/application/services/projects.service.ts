import { Inject, Injectable } from '@nestjs/common';

import type {
  CreateProjectDto,
  ProjectApi,
  ProjectDto,
} from '@intentra/workspace-contracts';

import { Project } from '../../domain/entities/index.js';
import { ProjectRepository } from '../ports/index.js';

@Injectable()
export class ProjectsService implements ProjectApi {
  constructor(
    @Inject(ProjectRepository)
    private readonly projectRepository: ProjectRepository,
  ) {}

  public async create(data: CreateProjectDto): Promise<ProjectDto> {
    const project = Project.create(data);
    await this.projectRepository.save(project);
    return {
      id: project.id.value,
      workspaceId: project.workspaceId.value,
      name: project.name,
      description: project.description,
    };
  }

  public async find(): Promise<ProjectDto[]> {
    const projects = await this.projectRepository.find();
    return projects.map(project => ({
      id: project.id.value,
      workspaceId: project.workspaceId.value,
      name: project.name,
      description: project.description,
    }));
  }
}
