import postgres, { type PostgresClient } from '@prisma/orm-postgres/runtime';

import type { Contract } from './contract.js';
import contractJson from './contract.json' with { type: 'json' };

/** Workspace's own Prisma client: Workspace owns its database, contract and migrations. */
export type WorkspaceDatabase = PostgresClient<Contract>;
/** DI token of the client; the same name as the type, as a class token reads. */
export const WorkspaceDatabase = Symbol('WorkspaceDatabase');

export function createWorkspaceDatabase(url: string): WorkspaceDatabase {
  return postgres<Contract>({ contractJson, url });
}
