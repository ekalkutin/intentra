import { z } from 'zod';

import {
  DecisionFieldsDtoSchema,
  RequirementFieldsDtoSchema,
  TermFieldsDtoSchema,
} from './knowledge-fields.dto.js';

const frame = {
  title: z.string(),
  /** What the Knowledge Item rests on; optional when entered by hand. */
  rationale: z.string().nullable().default(null),
};

export const RecordKnowledgeItemDtoSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('term'), ...frame, fields: TermFieldsDtoSchema }),
  z.object({
    kind: z.literal('requirement'),
    ...frame,
    fields: RequirementFieldsDtoSchema,
  }),
  z.object({
    kind: z.literal('decision'),
    ...frame,
    fields: DecisionFieldsDtoSchema,
  }),
]);

export type RecordKnowledgeItemDto = z.infer<
  typeof RecordKnowledgeItemDtoSchema
>;
