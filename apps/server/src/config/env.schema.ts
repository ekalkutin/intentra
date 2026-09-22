import { z } from 'zod';

/**
 * Плоские переменные окружения проверяются здесь и тут же превращаются в
 * вложенный объект, названный по-доменному. Так каждый модуль получает ровно
 * свой кусок настроек и не видит остальных, а `config.get('security')`
 * типизирован до последнего поля.
 */
export const EnvironmentSchema = z
  .object({
    PORT: z.coerce.number().int().positive().default(3000),

    /* Один инстанс Postgres, по базе на контекст (ADR 0001). */
    DB_HOST: z.string().nonempty().default('localhost'),
    DB_PORT: z.coerce.number().int().positive().default(10600),
    DB_USERNAME: z.string().nonempty(),
    DB_PASSWORD: z.string().nonempty(),
    IAM_DB: z.string().nonempty().default('iam'),
    WORKSPACE_DB: z.string().nonempty().default('workspace'),

    /* Без значения по умолчанию намеренно: сервер, подписывающий токены
       константой из исходников, не должен подниматься вообще. */
    JWT_SECRET: z.string().min(32),
    /* Сроки жизни токенов в секундах: час и неделя. */
    JWT_EXPIRES_IN: z.coerce.number().int().positive().default(3600),
    JWT_REFRESH_EXPIRES_IN: z.coerce.number().int().positive().default(604800),

    WEB_URL: z.url().default('http://localhost:5173'),
  })
  .transform(env => ({
    http: { port: env.PORT, webUrl: env.WEB_URL },
    database: {
      iam: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        username: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        name: env.IAM_DB,
      },
      workspace: {
        host: env.DB_HOST,
        port: env.DB_PORT,
        username: env.DB_USERNAME,
        password: env.DB_PASSWORD,
        name: env.WORKSPACE_DB,
      },
    },
    security: {
      jwtSecret: env.JWT_SECRET,
      accessTokenTtl: env.JWT_EXPIRES_IN,
      refreshTokenTtl: env.JWT_REFRESH_EXPIRES_IN,
    },
  }));

export type Variables = z.infer<typeof EnvironmentSchema>;
