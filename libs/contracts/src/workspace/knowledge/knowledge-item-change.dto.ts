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

/** Several items, each Knowledge Key once, with the version the client saw. */
const seenItems = z
  .array(z.object({ key: z.string(), version }))
  .min(1)
  .refine(items => new Set(items.map(({ key }) => key)).size === items.length, {
    message: 'Each Knowledge Key may appear once',
  });

export const ApproveKnowledgeItemsDtoSchema = z.object({
  /** Approved together, all or nothing. */
  items: seenItems,
});

export type ApproveKnowledgeItemsDto = z.infer<
  typeof ApproveKnowledgeItemsDtoSchema
>;

export const AssignToFeatureDtoSchema = z.object({
  feature: z
    .string()
    .nullable()
    .describe(
      'The Knowledge Key of the Approved Feature to put the items into, such as FEAT-2; null takes them out of their Feature.',
    ),
  /** Approved Scenarios, Requirements and Business Rules, assigned together, all or nothing. */
  items: seenItems,
});

export type AssignToFeatureDto = z.infer<typeof AssignToFeatureDtoSchema>;

export const ConfirmKnowledgeItemDtoSchema = z.object({ version });

export type ConfirmKnowledgeItemDto = z.infer<
  typeof ConfirmKnowledgeItemDtoSchema
>;
