import postgres, { type PostgresClient } from '@prisma/orm-postgres/runtime';

import type { Contract } from './contract.js';
import contractJson from './contract.json' with { type: 'json' };

/** Agents' own Prisma client: Agents owns its database, contract and migrations. */
export type AgentsDatabase = PostgresClient<Contract>;
/** DI token of the client; the same name as the type, as a class token reads. */
export const AgentsDatabase = Symbol('AgentsDatabase');

export function createAgentsDatabase(url: string): AgentsDatabase {
  return postgres<Contract>({ contractJson, url });
}
