import { resolve } from 'node:path';

import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

config({ path: resolve(import.meta.dirname, '../../.env') });
config({ path: resolve(import.meta.dirname, '.env') });

export default defineConfig({
  schema: './src/infrastructure/persistence/prisma/schema',
  migrations: { path: './src/infrastructure/persistence/prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
