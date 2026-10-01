import type { ToolsInput } from '@mastra/core/agent';

import {
  approveKnowledgeItemsTool,
  confirmKnowledgeItemTool,
  deleteKnowledgeDraftTool,
  echoTool,
  getKnowledgeDependenciesTool,
  getKnowledgeItemTool,
  getKnowledgeSummaryTool,
  KIND_TOOLS,
  listKnowledgeTool,
  listProjectsTool,
  offerChoicesTool,
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
    getKnowledgeSummaryTool,
    listKnowledgeTool,
    getKnowledgeItemTool,
    getKnowledgeDependenciesTool,
    ...KIND_TOOLS,
    approveKnowledgeItemsTool,
    confirmKnowledgeItemTool,
    rejectKnowledgeItemTool,
    retireKnowledgeItemTool,
    deleteKnowledgeDraftTool,
  ].map(tool => [tool.id, tool]),
) satisfies ToolsInput;

/**
 * The tools Intentra's own Agents may be given, each working in one Project:
 * no `list_projects`, and not approve, reject or retire, since only a person
 * approves knowledge; an Agent never does. A Platform Admin picks each
 * Agent's tools from these.
 */
export const AGENT_TOOLS = Object.fromEntries(
  [
    getKnowledgeSummaryTool,
    listKnowledgeTool,
    getKnowledgeItemTool,
    getKnowledgeDependenciesTool,
    ...KIND_TOOLS,
    confirmKnowledgeItemTool,
    deleteKnowledgeDraftTool,
    offerChoicesTool,
  ].map(tool => [tool.id, tool]),
) satisfies ToolsInput;

/** True for a tool that only reads; the code never gives the others to an Agent working with a Viewer. */
export function isReadOnlyTool(tool: AgentTool): boolean {
  return tool.mcp?.annotations?.readOnlyHint === true;
}

export type AgentTool = (typeof AGENT_TOOLS)[keyof typeof AGENT_TOOLS];
