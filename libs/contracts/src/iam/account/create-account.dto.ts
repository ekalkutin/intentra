import { z } from 'zod';

export const CreateAccountDtoSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type CreateAccountDto = z.infer<typeof CreateAccountDtoSchema>;
