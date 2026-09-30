import { z } from 'zod';

/** One answer the Orchestrator offers the Member to pick. */
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
});

export type ChoicesDto = z.infer<typeof ChoicesDtoSchema>;
