import { z } from 'zod';

export const EnvironmentSchema = z
  .object({
    PORT: z.coerce.number().default(3000),

    // MongoDB: one shared connection for all bounded contexts
    DB_URI: z.url(),

    // JWT: two different secrets, so a refresh token cannot pass as an access one
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),

    // Agents: encrypts the OpenRouter keys in the database (32 bytes, base64)
    AGENTS_SECRETS_KEY: z
      .base64()
      .refine(key => Buffer.from(key, 'base64').length === 32, {
        message: 'AGENTS_SECRETS_KEY must be 32 bytes',
      }),
    // The OpenRouter model a new orchestrator starts on
    AGENTS_DEFAULT_MODEL: z.string().default('anthropic/claude-sonnet-4.5'),
  })
  .refine(env => env.JWT_ACCESS_SECRET !== env.JWT_REFRESH_SECRET, {
    message: 'JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ',
  })
  .transform(env => ({
    listen: {
      port: env.PORT,
    },
    database: {
      uri: env.DB_URI,
    },
    jwt: {
      accessTokenSecret: env.JWT_ACCESS_SECRET,
      refreshTokenSecret: env.JWT_REFRESH_SECRET,
    },
    agents: {
      secretsKey: env.AGENTS_SECRETS_KEY,
      defaultModel: env.AGENTS_DEFAULT_MODEL,
    },
  }));

export type Variables = z.infer<typeof EnvironmentSchema>;
