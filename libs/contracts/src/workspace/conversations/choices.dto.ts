import { z } from 'zod';

import { KnowledgeKindDtoSchema } from '../knowledge/knowledge-kind.dto.js';

/** One answer Intentra offers the Member to pick. */
export const ChoiceOptionDtoSchema = z.object({
  label: z
    .string()
    .min(1)
    .max(120)
    .describe(
      'The answer as the person would say it, short: it is sent back as their reply.',
    ),
  description: z
    .string()
    .max(300)
    .nullable()
    .default(null)
    .describe('What choosing it means, if the label alone is not clear.'),
});

export type ChoiceOptionDto = z.infer<typeof ChoiceOptionDtoSchema>;

/**
 * A question with clear-cut answers, shown to the Member as cards to click
 * instead of typing; what they pick comes back as their next message.
 */
export const ChoicesDtoSchema = z.object({
  question: z
    .string()
    .min(1)
    .max(300)
    .describe('The question, in one sentence.'),
  options: z.array(ChoiceOptionDtoSchema).min(2).max(6),
  multiple: z
    .boolean()
    .default(false)
    .describe('Whether several answers may be picked together.'),
  allowCustom: z
    .boolean()
    .default(true)
    .describe('Whether the person may type an answer of their own instead.'),
  field: z
    .object({
      kind: KnowledgeKindDtoSchema,
      name: z.string().describe("The field's name, such as priority."),
    })
    .nullable()
    .default(null)
    .describe(
      "When the question picks the value of a field with fixed values, such as a Requirement's priority: its Kind and field. Then each label is one of the field's values exactly as the field takes it (such as must), and the person sees it with its icon and name in their language.",
    ),
});

export type ChoicesDto = z.infer<typeof ChoicesDtoSchema>;
