import postgres, { type PostgresClient } from '@prisma/orm-postgres/runtime';

import type { Contract } from './contract.js';
import contractJson from './contract.json' with { type: 'json' };

/** IAM's own Prisma client: IAM owns its database, contract and migrations. */
export type IamDatabase = PostgresClient<Contract>;
/** DI token of the client; the same name as the type, as a class token reads. */
export const IamDatabase = Symbol('IamDatabase');

export function createIamDatabase(url: string): IamDatabase {
  return postgres<Contract>({ contractJson, url });
}
