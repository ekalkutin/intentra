import type {
  CreateWorkspaceDto,
  FindWorkspacesDto,
  WorkspaceDto,
} from './workspace.dto.js';

/** Workspaces. Reached through `WorkspaceApi.workspaces`. */
export interface WorkspacesApi {
  create(data: CreateWorkspaceDto): Promise<WorkspaceDto>;
  /** Ids with no workspace are skipped; order is not guaranteed. */
  find(query?: FindWorkspacesDto): Promise<WorkspaceDto[]>;
}
