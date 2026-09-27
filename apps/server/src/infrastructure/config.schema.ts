import { z } from 'zod';

export const EnvironmentSchema = z
  .object({
    PORT: z.coerce.number().default(3000),

    // MongoDB: one shared connection for all bounded contexts
    DB_URI: z.url(),

    // JWT: two different secrets, so a refresh token cannot pass as an access one
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
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
  }));

export type Variables = z.infer<typeof EnvironmentSchema>;
