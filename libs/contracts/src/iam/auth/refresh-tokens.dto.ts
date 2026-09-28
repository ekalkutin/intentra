import { z } from 'zod';

export const RefreshTokensDtoSchema = z.object({
  refreshToken: z.string().min(1),
});

export type RefreshTokensDto = z.infer<typeof RefreshTokensDtoSchema>;
