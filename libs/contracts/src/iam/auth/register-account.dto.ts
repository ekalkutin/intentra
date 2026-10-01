import { z } from 'zod';

export const RegisterAccountDtoSchema = z.object({
  /** What the person is called; 1 to 100 characters. */
  name: z.string(),
  email: z.email(),
  password: z.string().min(8),
});

export type RegisterAccountDto = z.infer<typeof RegisterAccountDtoSchema>;

/** What IAM is told about a sign-up from outside it. */
export type SignUpContext = {
  /** The email has a pending Invitation to some Workspace, so it may sign up while Open Sign-up is off. */
  readonly invited: boolean;
};
