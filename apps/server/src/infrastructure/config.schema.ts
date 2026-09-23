import { z } from 'zod';

export const EnvironmentSchema = z
  .object({
    PORT: z.coerce.number().default(3000),

    // MongoDB: one shared connection for all bounded contexts
    DB_URI: z.url(),
  })
  .transform(env => ({
    listen: {
      port: env.PORT,
    },
    database: {
      uri: env.DB_URI,
    },
  }));

export type Variables = z.infer<typeof EnvironmentSchema>;
