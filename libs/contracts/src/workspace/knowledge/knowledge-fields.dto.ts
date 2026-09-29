import { z } from 'zod';

/** Only the main field of each Kind is required (docs/notes/knowledge-kinds.md). */
export const TermFieldsDtoSchema = z.object({
  definition: z.string(),
  sort: z
    .enum(['entity', 'value', 'role', 'action-event', 'other'])
    .nullable()
    .default(null),
  synonymsToAvoid: z.array(z.string()).default([]),
});

export type TermFieldsDto = z.infer<typeof TermFieldsDtoSchema>;

export const RequirementFieldsDtoSchema = z.object({
  /** What the system does or what quality it has. */
  statement: z.string(),
  type: z.enum(['functional', 'non-functional']).nullable().default(null),
  priority: z.enum(['must', 'should', 'could']).nullable().default(null),
  acceptanceCriteria: z.array(z.string()).default([]),
});

export type RequirementFieldsDto = z.infer<typeof RequirementFieldsDtoSchema>;

export const DecisionFieldsDtoSchema = z.object({
  decision: z.string(),
  area: z
    .enum(['architecture', 'product', 'business'])
    .nullable()
    .default(null),
  context: z.string().nullable().default(null),
  rejectedAlternatives: z
    .array(
      z.object({
        alternative: z.string(),
        reason: z.string().nullable().default(null),
      }),
    )
    .default([]),
});

export type DecisionFieldsDto = z.infer<typeof DecisionFieldsDtoSchema>;
