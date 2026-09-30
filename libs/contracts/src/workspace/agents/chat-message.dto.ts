import { z } from 'zod';

/** One turn of a Conversation: the Member's or the Orchestrator's. */
export const ChatMessageDtoSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

export type ChatMessageDto = z.infer<typeof ChatMessageDtoSchema>;
