// Wipes the database of the context it runs in (cwd), so `prisma db migrate` can replay
// every migration from scratch. Drops the app schema and Prisma's contract marker.
import 'dotenv/config';

import pg from 'pg';

const url = process.env['DATABASE_URL'];
if (!url) throw new Error('DATABASE_URL is not set');
if (process.env['NODE_ENV'] === 'production')
  throw new Error('Refusing to reset a production database');

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  console.log(`Resetting database "${client.database}"`);
  await client.query(`
    DROP SCHEMA IF EXISTS prisma_contract CASCADE;
    DROP SCHEMA IF EXISTS public CASCADE;
  `);
} finally {
  await client.end();
}
