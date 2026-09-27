#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/bc18ee552d1c5b9241b7b17aac2bee7c6b4c6e6f75ff8a79dc6e200bcdb8e10b/contract';
import endContract from '../../snapshots/bc18ee552d1c5b9241b7b17aac2bee7c6b4c6e6f75ff8a79dc6e200bcdb8e10b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'accounts',
        columns: [
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('password', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
