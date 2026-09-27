import type { CreateProjectDto, ProjectDto } from './project.dto.js';

/**
 * Projects of a workspace. Reached through `WorkspaceApi.projects`. Only
 * members of the workspace see its projects.
 */
export interface ProjectsApi {
  /** Throws `WORKSPACE_NOT_FOUND` (404) when the account is not a member. */
  create(accountId: string, data: CreateProjectDto): Promise<ProjectDto>;
  /** Projects of every workspace the account is a member of. */
  find(accountId: string): Promise<ProjectDto[]>;
}
