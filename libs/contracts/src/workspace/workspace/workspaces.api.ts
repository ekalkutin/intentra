import type {
  CreateWorkspaceDto,
  FindWorkspacesDto,
  WorkspaceDto,
} from './workspace.dto.js';

/**
 * Workspaces. Reached through `WorkspaceApi.workspaces`. An account sees only
 * the workspaces it is a member of; the others do not exist for it.
 */
export interface WorkspacesApi {
  /** The account becomes the first member. */
  create(accountId: string, data: CreateWorkspaceDto): Promise<WorkspaceDto>;
  /** Ids with no workspace are skipped; order is not guaranteed. */
  find(accountId: string, query?: FindWorkspacesDto): Promise<WorkspaceDto[]>;
  /** Throws `WORKSPACE_NOT_FOUND` (404), also for a non-member. */
  getById(accountId: string, id: string): Promise<WorkspaceDto>;
}
