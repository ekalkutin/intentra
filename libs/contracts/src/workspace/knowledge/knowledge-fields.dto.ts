import { z } from 'zod';

/**
 * The fields of each Kind. Only the main field is required
 * (docs/notes/knowledge-kinds.md); an empty optional field is a gap to ask
 * about, not something to invent. The descriptions reach agents as tool docs.
 */
export const TermFieldsDtoSchema = z.object({
  definition: z
    .string()
    .describe('The main field: what the word means in this Project.'),
  sort: z
    .enum(['entity', 'value', 'role', 'action-event', 'other'])
    .nullable()
    .default(null)
    .describe(
      'What sort of concept it names: something with its own identity, a value, a role, an action or event, or other.',
    ),
  synonymsToAvoid: z
    .array(z.string())
    .default([])
    .describe('Other words people use for it that the Project avoids.'),
});

export type TermFieldsDto = z.infer<typeof TermFieldsDtoSchema>;

export const RequirementFieldsDtoSchema = z.object({
  statement: z
    .string()
    .describe('The main field: what the system does, or what quality it has.'),
  type: z
    .enum(['functional', 'non-functional'])
    .nullable()
    .default(null)
    .describe('A function the system performs, or a quality it has.'),
  priority: z
    .enum(['must', 'should', 'could'])
    .nullable()
    .default(null)
    .describe('How much it matters.'),
  acceptanceCriteria: z
    .array(z.string())
    .default([])
    .describe('How to tell that it is met, one check per entry.'),
});

export type RequirementFieldsDto = z.infer<typeof RequirementFieldsDtoSchema>;

export const DecisionFieldsDtoSchema = z.object({
  decision: z.string().describe('The main field: what the Project has chosen.'),
  area: z
    .enum(['architecture', 'product', 'business'])
    .nullable()
    .default(null)
    .describe('What the choice is about.'),
  context: z
    .string()
    .nullable()
    .default(null)
    .describe('The situation that called for the choice.'),
  rejectedAlternatives: z
    .array(
      z.object({
        alternative: z.string().describe('An option that was turned down.'),
        reason: z
          .string()
          .nullable()
          .default(null)
          .describe('Why it was turned down.'),
      }),
    )
    .default([])
    .describe('The options turned down, each with why.'),
});

export type DecisionFieldsDto = z.infer<typeof DecisionFieldsDtoSchema>;
