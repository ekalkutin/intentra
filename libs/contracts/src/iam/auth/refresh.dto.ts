import { z } from 'zod';

export const RefreshDtoSchema = z.object({
  refreshToken: z.string().nonempty(),
});

export type RefreshDto = z.infer<typeof RefreshDtoSchema>;
