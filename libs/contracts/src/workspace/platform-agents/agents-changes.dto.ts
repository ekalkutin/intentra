import { z } from 'zod';

export const AgentsChangeKindDtoSchema = z.enum([
  'added',
  'changed',
  'removed',
]);

export type AgentsChangeKindDto = z.infer<typeof AgentsChangeKindDtoSchema>;

/** One object of the Unpublished Agents that differs from the Published Agents. */
export type AgentsChangeDto = {
  readonly id: string;
  readonly name: string;
  readonly kind: AgentsChangeKindDto;
  /** The fields that differ, for a changed object; empty otherwise. */
  readonly fields: readonly string[];
};

export const PublishingProblemCodeDtoSchema = z.enum([
  'intentra-count',
  'auditor-count',
  'duplicate-skill-name',
  'tool-unavailable',
  'skill-missing',
  'model-profile-missing',
  'specialist-calls-agents',
  'calls-non-specialist',
]);

export type PublishingProblemCodeDto = z.infer<
  typeof PublishingProblemCodeDtoSchema
>;

/** One thing that keeps the Unpublished Agents from being published. */
export type PublishingProblemDto = {
  readonly code: PublishingProblemCodeDto;
  /** The Agent or Skill it is about; null for the whole, such as Intentra's count. */
  readonly subject: {
    /** Null when it names several objects, such as two Skills with one name. */
    readonly id: string | null;
    readonly name: string;
  } | null;
  /** The tool, for a tool the code no longer has. */
  readonly tool: string | null;
};

/** What publishing would change, object by object, and what keeps it from being published. */
export type AgentsChangesDto = {
  readonly agents: readonly AgentsChangeDto[];
  readonly skills: readonly AgentsChangeDto[];
  readonly modelProfiles: readonly AgentsChangeDto[];
  /** Empty when the Unpublished Agents could be published. */
  readonly problems: readonly PublishingProblemDto[];
};
