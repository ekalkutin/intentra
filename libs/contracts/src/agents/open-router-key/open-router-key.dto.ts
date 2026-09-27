import { z } from 'zod';

/** What is shown of a stored key: never the key itself. */
export const OpenRouterKeyDtoSchema = z.object({
  /** The last characters of the key, to tell keys apart. */
  hint: z.string().nonempty(),
  updatedAt: z.iso.datetime(),
});

export const SetOpenRouterKeyDtoSchema = z.object({
  apiKey: z.string().trim().nonempty().max(500),
});

export type OpenRouterKeyDto = z.infer<typeof OpenRouterKeyDtoSchema>;
export type SetOpenRouterKeyDto = z.infer<typeof SetOpenRouterKeyDtoSchema>;
