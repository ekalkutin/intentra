import { z } from 'zod';

// The limits mirror the domain value objects; the domain still enforces them.
export const ACCOUNT_DISPLAY_NAME_MAX_LENGTH = 80;
export const ACCOUNT_PASSWORD_MIN_LENGTH = 8;

export const AccountDtoSchema = z.object({
  id: z.string().nonempty(),
  email: z.email(),
  /** `null`: not set yet; show the email instead. */
  displayName: z.string().nullable(),
});

export const UpdateAccountDtoSchema = z.object({
  /** `null` or blank clears it. */
  displayName: z
    .string()
    .trim()
    .max(ACCOUNT_DISPLAY_NAME_MAX_LENGTH)
    .nullable(),
});

export const ChangePasswordDtoSchema = z.object({
  currentPassword: z.string().nonempty(),
  newPassword: z.string().min(ACCOUNT_PASSWORD_MIN_LENGTH),
});

/** Accounts are only ever read by id, never listed wholesale. */
export const FindAccountsDtoSchema = z.object({
  ids: z.array(z.string().nonempty()),
});

export type AccountDto = z.infer<typeof AccountDtoSchema>;
export type UpdateAccountDto = z.infer<typeof UpdateAccountDtoSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordDtoSchema>;
export type FindAccountsDto = z.infer<typeof FindAccountsDtoSchema>;
