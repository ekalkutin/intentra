import { z } from 'zod';

export const PersonalAccessTokenDtoSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  createdAt: z.iso.datetime(),
  /** `null`: never expires. */
  expiresAt: z.iso.datetime().nullable(),
  revokedAt: z.iso.datetime().nullable(),
});

// The limit mirrors the domain value object; the domain still enforces it.
export const CreatePersonalAccessTokenDtoSchema = z.object({
  name: z.string().trim().nonempty().max(100),
  /** Omitted: never expires. */
  expiresInDays: z.int().positive().max(365).optional(),
});

/** The secret is shown only here, once; it is not stored and not found again. */
export const CreatedPersonalAccessTokenDtoSchema = z.object({
  token: z.string().nonempty(),
  personalAccessToken: PersonalAccessTokenDtoSchema,
});

export type PersonalAccessTokenDto = z.infer<
  typeof PersonalAccessTokenDtoSchema
>;
export type CreatePersonalAccessTokenDto = z.infer<
  typeof CreatePersonalAccessTokenDtoSchema
>;
export type CreatedPersonalAccessTokenDto = z.infer<
  typeof CreatedPersonalAccessTokenDtoSchema
>;
