import { z } from 'zod';

import { ACCOUNT_PASSWORD_MIN_LENGTH } from '../account/account.dto.js';

export const SignUpDtoSchema = z.object({
  email: z.email(),
  password: z.string().min(ACCOUNT_PASSWORD_MIN_LENGTH),
});

export type SignUpDto = z.infer<typeof SignUpDtoSchema>;
