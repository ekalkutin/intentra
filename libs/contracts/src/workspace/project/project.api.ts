import type { CreateProjectDto, ProjectDto } from './project.dto.js';

/** Projects of a workspace. Reached through `WorkspaceApi.projects`. */
export interface ProjectsApi {
  create(data: CreateProjectDto): Promise<ProjectDto>;
  find(): Promise<ProjectDto[]>;
}
