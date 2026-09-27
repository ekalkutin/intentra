import { z } from 'zod';

export const SignInDtoSchema = z.object({
  email: z.email(),
  password: z.string().nonempty(),
});

export type SignInDto = z.infer<typeof SignInDtoSchema>;
