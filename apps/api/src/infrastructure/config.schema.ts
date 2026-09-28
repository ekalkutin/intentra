import { z } from 'zod';

export const EnvironmentSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3000),
    DB_URI: z.url(),
    IAM_ACCESS_TOKEN_SECRET: z.string().min(32),
    IAM_REFRESH_TOKEN_SECRET: z.string().min(32),
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
    },
  }));

export type Variables = z.infer<typeof EnvironmentSchema>;
