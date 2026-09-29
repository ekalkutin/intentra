import { z } from 'zod';

import {
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
} from './knowledge-kind.dto.js';

export const ListKnowledgeItemsDtoSchema = z.object({
  kind: KnowledgeKindDtoSchema.optional(),
  status: KnowledgeStatusDtoSchema.optional(),
  take: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListKnowledgeItemsDto = z.infer<typeof ListKnowledgeItemsDtoSchema>;
