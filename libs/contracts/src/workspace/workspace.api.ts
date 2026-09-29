import type { WorkspacesApi } from './workspaces/workspaces.api.js';

export abstract class WorkspaceApi {
  abstract readonly workspaces: WorkspacesApi;
}
