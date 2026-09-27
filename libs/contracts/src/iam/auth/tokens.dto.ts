import { z } from 'zod';

export const TokensDtoSchema = z.object({
  accessToken: z.string().nonempty(),
  refreshToken: z.string().nonempty(),
});

export type TokensDto = z.infer<typeof TokensDtoSchema>;
