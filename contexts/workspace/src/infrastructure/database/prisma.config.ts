import 'dotenv/config';

import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

// Workspace owns its database: one contract, one migration history, one marker.
// Paths are relative to this file; the CLI finds it through --config.
export default definePrismaConfig({
  orm: ormConfig({
    contract: './contract.prisma',
    db: { connection: process.env['DATABASE_URL'] },
    migrations: { dir: 'migrations' },
  }),
});
