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
    /** Without it, Intentra's own Agents answer 503 `AGENT_NOT_CONFIGURED`. */
    OPENROUTER_API_KEY: z.string().optional(),
    /** A Mastra model router id on OpenRouter. */
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
        model: env.OPENROUTER_API_KEY
          ? { id: env.AGENT_MODEL, apiKey: env.OPENROUTER_API_KEY }
          : null,
      },
    },
  }));

export type Variables = z.infer<typeof EnvironmentSchema>;
