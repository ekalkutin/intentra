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
  .transform(env => ({
    listen: { port: env.PORT },
    database: { uri: env.DB_URI },
    iam: {
      accessTokenSecret: env.IAM_ACCESS_TOKEN_SECRET,
      refreshTokenSecret: env.IAM_REFRESH_TOKEN_SECRET,
      accessTokenTtlSeconds: env.IAM_ACCESS_TOKEN_TTL_SECONDS,
      refreshTokenTtlSeconds: env.IAM_REFRESH_TOKEN_TTL_SECONDS,
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
