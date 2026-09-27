import { z } from 'zod';

/**
 * One message of the AI SDK UI protocol (`useChat`). Only the shape is checked
 * here: its parts are checked by the runtime that reads them.
 */
const ChatMessageDtoSchema = z.looseObject({
  id: z.string(),
  role: z.enum(['system', 'user', 'assistant']),
  parts: z.array(z.unknown()),
});

/**
 * What `useChat` sends: the whole conversation, since the server keeps none.
 */
export const ChatRequestDtoSchema = z.looseObject({
  messages: z.array(ChatMessageDtoSchema).nonempty().max(200),
  trigger: z.enum(['submit-message', 'regenerate-message']).optional(),
});

export type ChatRequestDto = z.infer<typeof ChatRequestDtoSchema>;
