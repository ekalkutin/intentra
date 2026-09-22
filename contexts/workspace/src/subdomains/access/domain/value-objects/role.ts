import { Permission, Permissions } from './permission.js';

/** Роли на workspace. Полный набор PRD §7.12 и кастомные роли отложены. */
export const WorkspaceRoles = {
  Owner: 'owner',
  Member: 'member',
} as const;

/** Роли на проекте. */
export const ProjectRoles = {
  Viewer: 'viewer',
  Editor: 'editor',
} as const;

export type WorkspaceRole =
  (typeof WorkspaceRoles)[keyof typeof WorkspaceRoles];
export type ProjectRole = (typeof ProjectRoles)[keyof typeof ProjectRoles];
export type Role = WorkspaceRole | ProjectRole;

/**
 * Что даёт каждая роль.
 *
 * Пока это константа кода, а не строки в базе: ролей три с половиной, и таблица
 * ради них добавила бы миграцию к каждому новому праву, ничего не упростив.
 * Форма `RoleAssignment` от этого не зависит — она хранит код роли, поэтому
 * переезд каталога в данные не тронет ни выданные права, ни проверки (ADR 0002).
 *
 * `member` пуст намеренно: участник не может ничего сверх выданного ему точечно
 * на конкретном проекте.
 */
const CATALOGUE: Record<Role, readonly Permission[]> = {
  [WorkspaceRoles.Owner]: [
    Permissions.WorkspaceManage,
    Permissions.MembersManage,
    Permissions.ProjectsCreate,
  ],
  [WorkspaceRoles.Member]: [],
  [ProjectRoles.Viewer]: [Permissions.ProjectRead],
  [ProjectRoles.Editor]: [Permissions.ProjectRead, Permissions.ProjectWrite],
};

export function permissionsOf(role: Role): readonly Permission[] {
  return CATALOGUE[role] ?? [];
}

export function isWorkspaceRole(role: string): role is WorkspaceRole {
  return Object.values<string>(WorkspaceRoles).includes(role);
}

export function isProjectRole(role: string): role is ProjectRole {
  return Object.values<string>(ProjectRoles).includes(role);
}
