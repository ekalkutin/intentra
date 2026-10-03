import { z } from 'zod';

import type { KnowledgeDependencyDto } from './knowledge-item.dto.js';

export const FindSimilarKnowledgeItemsDtoSchema = z.object({
  take: z.coerce.number().int().min(1).max(50).default(10),
});

export type FindSimilarKnowledgeItemsDto = z.infer<
  typeof FindSimilarKnowledgeItemsDtoSchema
>;

/** A Similar Item, briefly, with how close in meaning it is. */
export type SimilarKnowledgeItemDto = KnowledgeDependencyDto & {
  /** From 0 (unrelated) to 1 (the same meaning); it says nothing about agreeing. */
  readonly similarity: number;
};

/**
 * The Drafts and Approved items closest in meaning to one Knowledge Item, the
 * closest first, the item itself left out.
 */
export type SimilarKnowledgeItemsDto = {
  readonly items: SimilarKnowledgeItemDto[];
  /** False while the Workspace has no Provider Key: meaning cannot be read without one, and `items` is empty. */
  readonly available: boolean;
};
