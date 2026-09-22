import { resolve } from 'node:path';

import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

config({ path: resolve(import.meta.dirname, '../../.env') });
config({ path: resolve(import.meta.dirname, '.env') });

/* Своя база на контекст (ADR 0001): имя приходит переменной с префиксом
 * контекста, хост и учётные данные — общие для инстанса Postgres. */
const url = `postgresql://${env('WORKSPACE_DB_USERNAME')}:${env('WORKSPACE_DB_PASSWORD')}@${env('WORKSPACE_DB_HOST')}:${env('WORKSPACE_DB_PORT')}/${env('WORKSPACE_DB_NAME')}`;

export default defineConfig({
  schema: './src/infrastructure/persistence/prisma/schema',
  migrations: { path: './src/infrastructure/persistence/prisma/migrations' },
  datasource: { url },
});
