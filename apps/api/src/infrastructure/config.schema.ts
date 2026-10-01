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
    /** Both or neither: the Account made the only Platform Admin on start, created with this password if missing. */
    PLATFORM_ADMIN_EMAIL: z.email().optional(),
    PLATFORM_ADMIN_PASSWORD: z.string().min(8).optional(),
    /** 32 random bytes in base64 that encrypt every Workspace's Provider Key. */
    PROVIDER_KEY_ENCRYPTION_KEY: z
      .base64()
      .refine(value => Buffer.from(value, 'base64').length === 32, {
        message: 'PROVIDER_KEY_ENCRYPTION_KEY must be 32 bytes in base64',
      }),
    /** A Mastra model router id on OpenRouter, run on each Workspace's Provider Key. */
    AGENT_MODEL: z
      .templateLiteral(['openrouter/', z.string(), '/', z.string()])
      .default('openrouter/anthropic/claude-sonnet-5'),
  })
  .refine(env => env.IAM_ACCESS_TOKEN_SECRET !== env.IAM_REFRESH_TOKEN_SECRET, {
    message: 'IAM_ACCESS_TOKEN_SECRET and IAM_REFRESH_TOKEN_SECRET must differ',
  })
  .refine(
    env =>
      (env.PLATFORM_ADMIN_EMAIL === undefined) ===
      (env.PLATFORM_ADMIN_PASSWORD === undefined),
    {
      message:
        'PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD go together: set both or neither',
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
        env.PLATFORM_ADMIN_EMAIL && env.PLATFORM_ADMIN_PASSWORD
          ? {
              email: env.PLATFORM_ADMIN_EMAIL,
              password: env.PLATFORM_ADMIN_PASSWORD,
            }
          : null,
    },
    workspace: {
      agents: {
        model: (providerKey: string) => ({
          id: env.AGENT_MODEL,
          apiKey: providerKey,
        }),
        providerKeyEncryptionKey: env.PROVIDER_KEY_ENCRYPTION_KEY,
      },
    },
  }));

export type Variables = z.infer<typeof EnvironmentSchema>;
