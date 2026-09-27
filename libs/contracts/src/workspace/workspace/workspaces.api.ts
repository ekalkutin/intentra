import type { CreateWorkspaceDto, WorkspaceDto } from './workspace.dto.js';

/** Workspaces. Reached through `WorkspaceApi.workspaces`. */
export interface WorkspacesApi {
  create(data: CreateWorkspaceDto): Promise<WorkspaceDto>;
  find(): Promise<WorkspaceDto[]>;
}
