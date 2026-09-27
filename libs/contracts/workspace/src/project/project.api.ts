import { CreateProjectDto, ProjectDto } from './project.dto.js';

export interface ProjectApi {
  create(data: CreateProjectDto): Promise<ProjectDto>;
  find(): Promise<ProjectDto[]>;
}
