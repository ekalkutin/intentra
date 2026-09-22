import { ProjectsApi } from './projects.api.js';
import { WorkspacesApi } from './workspaces.api.js';

export interface WorkspaceApi {
  readonly workspaces: WorkspacesApi;
  readonly projects: ProjectsApi;
}
