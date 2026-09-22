import { WorkspaceApi } from '@intentra/workspace-contracts';

/** Опубликованный API Workspace глазами потребителя. */
export abstract class WorkspaceClientPort implements WorkspaceApi {
  abstract readonly workspaces: WorkspaceApi['workspaces'];
  abstract readonly projects: WorkspaceApi['projects'];
}
