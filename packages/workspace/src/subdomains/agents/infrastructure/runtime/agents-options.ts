import type { MastraModelConfig } from '@mastra/core/llm';

/** How the server runs Intentra's own Agents. */
export type AgentsOptions = {
  /** A Model Profile's model on the Workspace's Provider Key. */
  readonly model: (modelId: string, providerKey: string) => MastraModelConfig;
  /**
   * 32 bytes in base64 that encrypt every Provider Key; required to add or use
   * one. Changing it makes the stored keys unreadable.
   */
  readonly providerKeyEncryptionKey: string | null;
  /** The most steps (tool calls or text) in one answer. */
  readonly maxSteps: number;
  /** The longest one answer may run, in milliseconds. */
  readonly timeoutMs: number;
  /** How much of a Conversation's history the model sees, in tokens; older messages are left out. */
  readonly historyTokens: number;
  /** The most steps (tool calls or text) in one Analysis Run. */
  readonly auditMaxSteps: number;
  /** The longest one Analysis Run may run, in milliseconds. */
  readonly auditTimeoutMs: number;
  /** The hour, in UTC, when the nightly Analysis Runs start; null for none (tests). */
  readonly analysisScheduleHourUtc: number | null;
};

export const DEFAULT_AGENTS_OPTIONS: AgentsOptions = {
  // A Model Profile's model id always reads `openrouter/<vendor>/<model>`.
  model: (modelId, providerKey) => ({
    id: modelId as `${string}/${string}`,
    apiKey: providerKey,
  }),
  providerKeyEncryptionKey: null,
  maxSteps: 25,
  timeoutMs: 3 * 60 * 1000,
  historyTokens: 64_000,
  auditMaxSteps: 40,
  auditTimeoutMs: 10 * 60 * 1000,
  analysisScheduleHourUtc: null,
};

export const AGENTS_OPTIONS = Symbol('AGENTS_OPTIONS');
