import { z } from 'zod';

export const ListConversationsDtoSchema = z.object({
  /** The hidden Conversations (`true`) instead of the shown ones. */
  hidden: z
    .preprocess(
      value => (value === 'true' ? true : value === 'false' ? false : value),
      z.boolean(),
    )
    .default(false),
  take: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListConversationsDto = z.infer<typeof ListConversationsDtoSchema>;
