import type { ToolsInput } from '@mastra/core/agent';

import {
  approveKnowledgeItemTool,
  deleteKnowledgeDraftTool,
  echoTool,
  getKnowledgeItemTool,
  KIND_TOOLS,
  listKnowledgeTool,
  listProjectsTool,
  rejectKnowledgeItemTool,
  retireKnowledgeItemTool,
} from './tools/index.js';

/**
 * Tools offered to external agents through MCP. Each one states
 * `mcp.annotations.readOnlyHint`, and `destructiveHint` if it deletes data.
 */
export const MCP_TOOLS = Object.fromEntries(
  [
    echoTool,
    listProjectsTool,
    listKnowledgeTool,
    getKnowledgeItemTool,
    ...KIND_TOOLS,
    approveKnowledgeItemTool,
    rejectKnowledgeItemTool,
    retireKnowledgeItemTool,
    deleteKnowledgeDraftTool,
  ].map(tool => [tool.id, tool]),
) satisfies ToolsInput;

/** Tools offered to Intentra's own agents. */
export const AGENT_TOOLS = {
  [echoTool.id]: echoTool,
} satisfies ToolsInput;
