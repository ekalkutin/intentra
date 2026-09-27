/**
 * The key an agent runs under in the chat. Only letters, digits and `_` are
 * safe in the tool names built from it, and the profile id keeps it stable
 * between turns.
 */
export const agentRunKey = (profileId: string): string =>
  `agent_${profileId.replaceAll('-', '')}`;

/**
 * The tool the orchestrator calls to delegate to an agent, as it appears in
 * the chat stream. Mastra names it `agent-<key>`.
 */
export const delegationToolName = (profileId: string): string =>
  `agent-${agentRunKey(profileId)}`;
