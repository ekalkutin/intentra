import { z } from 'zod';

import {
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
} from './knowledge-kind.dto.js';

export const ListKnowledgeItemsDtoSchema = z.object({
  kind: KnowledgeKindDtoSchema.optional(),
  /**
   * Any of these statuses; without it, Drafts and Approved (Rejected only
   * when asked for). In a query string: `statuses=draft,approved`.
   */
  statuses: z
    .preprocess(
      value => (typeof value === 'string' ? value.split(',') : value),
      z.array(KnowledgeStatusDtoSchema).min(1),
    )
    .optional(),
  /** Only items marked Needs Review (`true`) or only unmarked ones (`false`). */
  needsReview: z
    .preprocess(
      value => (value === 'true' ? true : value === 'false' ? false : value),
      z.boolean(),
    )
    .optional(),
  take: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListKnowledgeItemsDto = z.infer<typeof ListKnowledgeItemsDtoSchema>;
