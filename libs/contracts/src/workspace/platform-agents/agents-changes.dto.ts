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

/** What publishing would change, object by object. */
export type AgentsChangesDto = {
  readonly agents: readonly AgentsChangeDto[];
  readonly skills: readonly AgentsChangeDto[];
  readonly modelProfiles: readonly AgentsChangeDto[];
};
