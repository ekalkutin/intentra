import type { ToolsInput } from '@mastra/core/agent';

import { echoTool } from './tools/index.js';

/**
 * Tools offered to external agents through MCP. Each one states
 * `mcp.annotations.readOnlyHint`, and `destructiveHint` if it deletes data.
 */
export const MCP_TOOLS = {
  [echoTool.id]: echoTool,
} satisfies ToolsInput;

/** Tools offered to Intentra's own agents. */
export const AGENT_TOOLS = {
  [echoTool.id]: echoTool,
} satisfies ToolsInput;
