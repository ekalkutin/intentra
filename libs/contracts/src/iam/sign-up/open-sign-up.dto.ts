import { z } from 'zod';

export const OpenSignUpDtoSchema = z.object({
  /** Off: only an email with a pending Invitation may sign up. */
  open: z.boolean(),
});

export type OpenSignUpDto = z.infer<typeof OpenSignUpDtoSchema>;
