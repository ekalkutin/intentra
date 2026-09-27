import type { ToolDefinition } from './define-tool.js';
import { listWorkspacesTool } from './tools/workspace/list-workspaces.tool.js';

/** Every tool Intentra knows. Adapters pick the ones exposed to them. */
export const TOOL_CATALOG: readonly ToolDefinition[] = [listWorkspacesTool];
