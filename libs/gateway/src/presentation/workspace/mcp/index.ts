import { WorkspaceClientPort } from '../../../application/ports/index.js';

import { listProjectsTool } from './list-projects.tool.js';
import { listWorkspacesTool } from './list-workspaces.tool.js';

/**
 * Инструменты, за которыми стоит Workspace. Имена в стиле протокола —
 * `snake_case`: их печатает в своих списках всякий MCP-клиент.
 */
export const workspaceTools = (workspace: WorkspaceClientPort) => ({
  list_workspaces: listWorkspacesTool(workspace),
  list_projects: listProjectsTool(workspace),
});
