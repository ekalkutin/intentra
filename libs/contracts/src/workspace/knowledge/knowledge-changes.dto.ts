import { z } from 'zod';

export const GetKnowledgeChangesDtoSchema = z.object({
  /** ISO 8601: what changed after this moment. */
  since: z.iso.datetime({ offset: true }),
});

export type GetKnowledgeChangesDto = z.infer<
  typeof GetKnowledgeChangesDtoSchema
>;

/** What changed in a Project's Approved knowledge after a moment, by Knowledge Key. */
export type KnowledgeChangesDto = {
  /** Approved since then and still Approved, replacements included. */
  readonly approved: string[];
  /** Retired since then. */
  readonly retired: string[];
};
