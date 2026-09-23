import { z } from 'zod';

export const AccountDtoSchema = z.object({
  id: z.string().nonempty(),
  email: z.email(),
});

export type AccountDto = z.infer<typeof AccountDtoSchema>;
