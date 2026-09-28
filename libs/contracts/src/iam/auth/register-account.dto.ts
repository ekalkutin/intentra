import { z } from 'zod';

export const RegisterAccountDtoSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type RegisterAccountDto = z.infer<typeof RegisterAccountDtoSchema>;
