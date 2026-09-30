import { z } from 'zod';

/** The longest message a Member may send, counted over its text parts. */
export const MESSAGE_MAX_LENGTH = 20_000;

/**
 * The Member's new message, in the AI SDK UI message format; only text parts.
 * The Conversation's earlier messages are never sent back: the server keeps them.
 */
export const SendMessageDtoSchema = z.object({
  message: z.object({
    id: z.string().min(1).optional(),
    role: z.literal('user'),
    parts: z
      .array(z.object({ type: z.literal('text'), text: z.string().min(1) }))
      .min(1)
      .refine(
        parts =>
          parts.reduce((length, { text }) => length + text.length, 0) <=
          MESSAGE_MAX_LENGTH,
        { message: `A message has at most ${MESSAGE_MAX_LENGTH} characters` },
      ),
  }),
});

export type SendMessageDto = z.infer<typeof SendMessageDtoSchema>;
