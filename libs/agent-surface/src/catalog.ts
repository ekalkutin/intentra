import type { ResourceDefinition } from './resources/define-resource.js';
import type { ToolDefinition } from './tools/define-tool.js';
import { listWorkspacesTool } from './tools/workspace/list-workspaces.tool.js';

/** Every tool Intentra knows. Adapters pick the ones exposed to them. */
export const TOOL_CATALOG: readonly ToolDefinition[] = [listWorkspacesTool];

/**
 * Every resource Intentra knows. Empty until a context owns knowledge worth
 * handing to agents; the first one is the approved project context.
 */
export const RESOURCE_CATALOG: readonly ResourceDefinition[] = [];
