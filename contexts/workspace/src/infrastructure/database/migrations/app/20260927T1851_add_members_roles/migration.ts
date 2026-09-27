#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/7f6af5e5313e5c42ca929b0b916cae1c32a154ef1ae55877a37203ce5ddcd604/contract';
import endContract from '../../snapshots/7f6af5e5313e5c42ca929b0b916cae1c32a154ef1ae55877a37203ce5ddcd604/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/c4cec6ed395713c6d2e08609298111b8335102812ac4a8b41c327bffe6a3ae4a/contract';
import startContract from '../../snapshots/c4cec6ed395713c6d2e08609298111b8335102812ac4a8b41c327bffe6a3ae4a/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'members',
        columns: [
          col('account_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('role_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('workspace_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'project_members',
        columns: [
          col('member_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('project_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('role_id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['project_id', 'member_id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'roles',
        columns: [
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('scope', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('workspace_id', 'uuid', { codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('roles_scope_check_0058d1ca', "\"scope\" IN ('workspace', 'project')"),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'members',
        constraint: 'members_workspace_id_account_id_key',
        columns: ['workspace_id', 'account_id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'roles',
        constraint: 'roles_workspace_id_scope_name_key',
        columns: ['workspace_id', 'scope', 'name'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'members',
        index: 'members_role_id_idx_d9467c50',
        columns: ['role_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'members',
        index: 'members_workspace_id_idx_90a9f461',
        columns: ['workspace_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'project_members',
        index: 'project_members_member_id_idx_10d5a0e2',
        columns: ['member_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'project_members',
        index: 'project_members_project_id_idx_6ad92603',
        columns: ['project_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'project_members',
        index: 'project_members_role_id_idx_d9467c50',
        columns: ['role_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'roles',
        index: 'roles_workspace_id_idx_90a9f461',
        columns: ['workspace_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'members',
        foreignKey: {
          name: 'members_workspace_id_fkey',
          columns: ['workspace_id'],
          references: { schema: 'public', table: 'workspaces', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'members',
        foreignKey: {
          name: 'members_role_id_fkey',
          columns: ['role_id'],
          references: { schema: 'public', table: 'roles', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'project_members',
        foreignKey: {
          name: 'project_members_project_id_fkey',
          columns: ['project_id'],
          references: { schema: 'public', table: 'projects', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'project_members',
        foreignKey: {
          name: 'project_members_member_id_fkey',
          columns: ['member_id'],
          references: { schema: 'public', table: 'members', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'project_members',
        foreignKey: {
          name: 'project_members_role_id_fkey',
          columns: ['role_id'],
          references: { schema: 'public', table: 'roles', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'roles',
        foreignKey: {
          name: 'roles_workspace_id_fkey',
          columns: ['workspace_id'],
          references: { schema: 'public', table: 'workspaces', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
