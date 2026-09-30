import { z } from 'zod';

/** What a Member changes in their Conversation; what is left out stays as it is. */
export const EditConversationDtoSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    hidden: z.boolean().optional(),
  })
  .refine(data => data.title !== undefined || data.hidden !== undefined, {
    message: 'Change the title, hidden, or both',
  });

export type EditConversationDto = z.infer<typeof EditConversationDtoSchema>;
