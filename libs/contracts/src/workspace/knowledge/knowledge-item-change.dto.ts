import { z } from 'zod';

/** The version the client last saw (409 `KNOWLEDGE_ITEM_CHANGED` if it is not the current one). */
const version = z.number().int().min(1);

export const DeleteKnowledgeItemDtoSchema = z.object({ version });

export type DeleteKnowledgeItemDto = z.infer<
  typeof DeleteKnowledgeItemDtoSchema
>;

export const ApproveKnowledgeItemDtoSchema = z.object({ version });

export type ApproveKnowledgeItemDto = z.infer<
  typeof ApproveKnowledgeItemDtoSchema
>;

export const RejectKnowledgeItemDtoSchema = z.object({
  version,
  reason: z.string().nullable().default(null),
});

export type RejectKnowledgeItemDto = z.infer<
  typeof RejectKnowledgeItemDtoSchema
>;

export const RetireKnowledgeItemDtoSchema = z.object({
  version,
  reason: z.string().nullable().default(null),
});

export type RetireKnowledgeItemDto = z.infer<
  typeof RetireKnowledgeItemDtoSchema
>;
