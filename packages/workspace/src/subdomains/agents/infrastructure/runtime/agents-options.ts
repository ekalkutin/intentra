import type { MastraModelConfig } from '@mastra/core/llm';

/** How the server runs Intentra's own Agents. */
export type AgentsOptions = {
  /** The one model every Agent runs on for now; null when the server has none (503 `AGENT_NOT_CONFIGURED`). */
  readonly model: MastraModelConfig | null;
  /** The most steps (tool calls or text) in one answer. */
  readonly maxSteps: number;
  /** The longest one answer may run, in milliseconds. */
  readonly timeoutMs: number;
  /** How much of a Conversation's history the model sees, in tokens; older messages are left out. */
  readonly historyTokens: number;
};

export const DEFAULT_AGENTS_OPTIONS: AgentsOptions = {
  model: null,
  maxSteps: 25,
  timeoutMs: 3 * 60 * 1000,
  historyTokens: 64_000,
};

export const AGENTS_OPTIONS = Symbol('AGENTS_OPTIONS');
