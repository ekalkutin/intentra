import { z } from 'zod';

export const AgentRoleDtoSchema = z.enum(['intentra', 'specialist']);

export type AgentRoleDto = z.infer<typeof AgentRoleDtoSchema>;

export const ReasoningEffortDtoSchema = z.enum(['low', 'medium', 'high']);

export type ReasoningEffortDto = z.infer<typeof ReasoningEffortDtoSchema>;

/** One of Intentra's Agents as a Platform Admin designs it. */
export type PlatformAgentDto = {
  /** Stays the same across Agents Versions. */
  readonly id: string;
  readonly role: AgentRoleDto;
  readonly name: string;
  /** For a Specialist, what Intentra reads to decide when to call it. */
  readonly description: string;
  /** How the Agent works; the code adds the Project and the rules of the Member's Project Role. */
  readonly instructions: string;
  /** Ids from the code's tool catalog. */
  readonly tools: readonly string[];
  /** Ids of Intentra's own Skills. */
  readonly skillIds: readonly string[];
  readonly modelProfileId: string;
  /** The Specialists Intentra may call; always empty for a Specialist. */
  readonly specialistIds: readonly string[];
};

/** One of Intentra's own Skills. */
export type SkillDto = {
  readonly id: string;
  /** Unique, `[a-z0-9-]`, starting with `intentra-`. */
  readonly name: string;
  /** When to use it; an Agent always sees this. */
  readonly description: string;
  /** Markdown the Agent reads only when a task calls for it. */
  readonly instructions: string;
};

/** One of Intentra's built-in Model Profiles. */
export type ModelProfileDto = {
  readonly id: string;
  readonly name: string;
  /** A model on OpenRouter, such as `openrouter/anthropic/claude-sonnet-5`. */
  readonly modelId: string;
  /** Null: the model's default. */
  readonly temperature: number | null;
  /** Null: the model's default. */
  readonly reasoningEffort: ReasoningEffortDto | null;
  /** The longest answer in tokens; null: the model's default. */
  readonly maxOutputTokens: number | null;
};

/** Everything that shapes how the Agents behave, as one whole. */
export type AgentsContentDto = {
  readonly agents: readonly PlatformAgentDto[];
  readonly skills: readonly SkillDto[];
  readonly modelProfiles: readonly ModelProfileDto[];
};
