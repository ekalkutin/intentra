import type { ToolsInput } from '@mastra/core/agent';

import {
  approveKnowledgeItemsTool,
  confirmKnowledgeItemTool,
  deleteKnowledgeDraftTool,
  echoTool,
  getContextTool,
  getKnowledgeDependenciesTool,
  getKnowledgeItemTool,
  getKnowledgeSummaryTool,
  getProjectFrameTool,
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
    getProjectFrameTool,
    getContextTool,
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

/** What an external agent is told about Intentra when it connects over MCP. */
export const MCP_INSTRUCTIONS = [
  "Intentra keeps a Project's knowledge: what the product is, for whom, its requirements, rules, terms and decisions, each recorded as a Draft and confirmed by a person (Approved).",
  'Before working on code of a Project: find its id with list_projects, read get_project_frame once per session (what holds for every task), then for each task pick the Approved items it is about from list_knowledge and read their Context Pack with get_context. Build on Approved knowledge only; where the pack shows something unsettled, in conflict or under review, ask the person.',
  'When the person tells you something new about the product, record it as a Draft with the record_ tool of its Kind, after checking with list_knowledge that it is not known already; only a person approves.',
].join('\n\n');

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
