#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/111305e315dd7b2ffca2e3f55addcbbe85ac5ff949b4240662501546b54df446/contract';
import endContract from '../../snapshots/111305e315dd7b2ffca2e3f55addcbbe85ac5ff949b4240662501546b54df446/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'agent_profiles',
        columns: [
          col('archived_at', 'timestamptz(3)', {
            codecRef: { codecId: 'pg/timestamptz-temporal@1', typeParams: { precision: 3 } },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('instructions', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('model_name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('model_provider', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('tools', 'text[]', { notNull: true, codecRef: { codecId: 'pg/text@1', many: true } }),
          col('workspace_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'agent_profiles_tools_elem_not_null_89bdc909',
            'array_position("tools", NULL) IS NULL',
          ),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'agent_profiles',
        index: 'agent_profiles_workspace_id_idx_90a9f461',
        columns: ['workspace_id'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
