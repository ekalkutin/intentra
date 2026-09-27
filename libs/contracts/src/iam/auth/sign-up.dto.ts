import { z } from 'zod';

export const SignUpDtoSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type SignUpDto = z.infer<typeof SignUpDtoSchema>;
