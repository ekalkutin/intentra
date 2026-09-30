import { z } from 'zod';

import { ChatMessageDtoSchema } from './chat-message.dto.js';

/** The whole Conversation so far, oldest first; the last message is the Member's. */
export const ChatRequestDtoSchema = z.object({
  messages: z
    .array(ChatMessageDtoSchema)
    .min(1)
    .max(200)
    .refine(messages => messages.at(-1)?.role === 'user', {
      message: "The last message must be the Member's",
    }),
});

export type ChatRequestDto = z.infer<typeof ChatRequestDtoSchema>;
