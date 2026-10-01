import type { MastraModelConfig } from '@mastra/core/llm';

/** One of Intentra's Agents as published, ready to run. */
export type AgentDefinition = {
  readonly name: string;
  /** For a Specialist, what the Orchestrator reads to decide when to call it. */
  readonly description: string;
  /** How it works; the code frames them with the Project and the Member's Project Role. */
  readonly instructions: string;
  /** Ids from `AGENT_TOOLS`; with a Viewer only those that read are given. */
  readonly toolIds: readonly string[];
  readonly skills: readonly {
    readonly name: string;
    readonly description: string;
    readonly instructions: string;
  }[];
  /** Such as `{ id: 'openrouter/anthropic/claude-sonnet-5', apiKey }`. */
  readonly model: MastraModelConfig;
  readonly temperature: number | null;
  readonly reasoningEffort: 'low' | 'medium' | 'high' | null;
  readonly maxOutputTokens: number | null;
};
