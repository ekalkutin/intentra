import { z } from 'zod';

export const EnvironmentSchema = z
  .object({
    PORT: z.coerce.number().default(3000),

    // Postgres: every bounded context owns its database
    IAM_DATABASE_URL: z.url(),
    WORKSPACE_DATABASE_URL: z.url(),
    AGENTS_DATABASE_URL: z.url(),
  })
  .transform(env => ({
    listen: {
      port: env.PORT,
    },
    iam: {
      database: {
        url: env.IAM_DATABASE_URL,
      },
    },
    workspace: {
      database: {
        url: env.WORKSPACE_DATABASE_URL,
      },
    },
    agents: {
      database: {
        url: env.AGENTS_DATABASE_URL,
      },
    },
  }));

export type Variables = z.infer<typeof EnvironmentSchema>;
