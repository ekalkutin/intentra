import { z } from 'zod';

export const SetProviderKeyDtoSchema = z.object({
  /** The OpenRouter key as the provider issued it; checked with OpenRouter before it is kept. */
  key: z.string(),
});

export type SetProviderKeyDto = z.infer<typeof SetProviderKeyDtoSchema>;
