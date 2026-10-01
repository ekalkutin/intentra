import { z } from 'zod';

export const EnvironmentSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3000),
    DB_URI: z.url(),
    IAM_ACCESS_TOKEN_SECRET: z.string().min(32),
    IAM_REFRESH_TOKEN_SECRET: z.string().min(32),
    IAM_ACCESS_TOKEN_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(900),
    IAM_REFRESH_TOKEN_TTL_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(604800),
    /** All or none: the Account made the only Platform Admin on start, created with this name and password if missing. */
    PLATFORM_ADMIN_EMAIL: z.email().optional(),
    PLATFORM_ADMIN_NAME: z.string().trim().min(1).max(100).optional(),
    PLATFORM_ADMIN_PASSWORD: z.string().min(8).optional(),
    /** 32 random bytes in base64 that encrypt every Workspace's Provider Key. */
    PROVIDER_KEY_ENCRYPTION_KEY: z
      .base64()
      .refine(value => Buffer.from(value, 'base64').length === 32, {
        message: 'PROVIDER_KEY_ENCRYPTION_KEY must be 32 bytes in base64',
      }),
  })
  .refine(env => env.IAM_ACCESS_TOKEN_SECRET !== env.IAM_REFRESH_TOKEN_SECRET, {
    message: 'IAM_ACCESS_TOKEN_SECRET and IAM_REFRESH_TOKEN_SECRET must differ',
  })
  .refine(
    env =>
      new Set([
        env.PLATFORM_ADMIN_EMAIL === undefined,
        env.PLATFORM_ADMIN_NAME === undefined,
        env.PLATFORM_ADMIN_PASSWORD === undefined,
      ]).size === 1,
    {
      message:
        'PLATFORM_ADMIN_EMAIL, PLATFORM_ADMIN_NAME and PLATFORM_ADMIN_PASSWORD go together: set all or none',
    },
  )
  .transform(env => ({
    listen: { port: env.PORT },
    database: { uri: env.DB_URI },
    iam: {
      accessTokenSecret: env.IAM_ACCESS_TOKEN_SECRET,
      refreshTokenSecret: env.IAM_REFRESH_TOKEN_SECRET,
      accessTokenTtlSeconds: env.IAM_ACCESS_TOKEN_TTL_SECONDS,
      refreshTokenTtlSeconds: env.IAM_REFRESH_TOKEN_TTL_SECONDS,
      platformAdmin:
        env.PLATFORM_ADMIN_EMAIL &&
        env.PLATFORM_ADMIN_NAME &&
        env.PLATFORM_ADMIN_PASSWORD
          ? {
              email: env.PLATFORM_ADMIN_EMAIL,
              name: env.PLATFORM_ADMIN_NAME,
              password: env.PLATFORM_ADMIN_PASSWORD,
            }
          : null,
    },
    workspace: {
      agents: {
        providerKeyEncryptionKey: env.PROVIDER_KEY_ENCRYPTION_KEY,
      },
    },
  }));

export type Variables = z.infer<typeof EnvironmentSchema>;
