import { z } from 'zod';

import {
  DecisionFieldsDtoSchema,
  RequirementFieldsDtoSchema,
  TermFieldsDtoSchema,
} from './knowledge-fields.dto.js';

const frame = {
  title: z.string().optional(),
  /** Null clears it. */
  rationale: z.string().nullable().optional(),
};

/**
 * Changes a Draft; what is left out stays as it is, and `fields` replaces all
 * of them. `kind` must be the Draft's own Kind, which never changes
 * (400 `KNOWLEDGE_KIND_MISMATCH`).
 */
export const EditKnowledgeItemDtoSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('term'),
    ...frame,
    fields: TermFieldsDtoSchema.optional(),
  }),
  z.object({
    kind: z.literal('requirement'),
    ...frame,
    fields: RequirementFieldsDtoSchema.optional(),
  }),
  z.object({
    kind: z.literal('decision'),
    ...frame,
    fields: DecisionFieldsDtoSchema.optional(),
  }),
]);

export type EditKnowledgeItemDto = z.infer<typeof EditKnowledgeItemDtoSchema>;
