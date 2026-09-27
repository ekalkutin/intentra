import type { ProjectsApi } from './project/project.api.js';
import type { WorkspacesApi } from './workspace/workspaces.api.js';

/**
 * Published API of the Workspace context. The class itself is the DI token.
 * Monolith: bound to the context's local service. Micro-services: to an HTTP
 * client.
 */
export abstract class WorkspaceApi {
  abstract readonly workspaces: WorkspacesApi;
  abstract readonly projects: ProjectsApi;
}
