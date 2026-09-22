/**
 * Атомарное разрешение на действие, из которых складываются роли.
 *
 * Код читается как «уровень: предмет: действие» и живёт в нижнем регистре —
 * так его не спутать с кодом роли, который пишется словом из языка
 * пользователя (`owner`, `member`).
 */
export const Permissions = {
  WorkspaceManage: 'workspace:settings:manage',
  MembersManage: 'workspace:members:manage',
  ProjectsCreate: 'workspace:projects:create',
  ProjectRead: 'project:read',
  ProjectWrite: 'project:write',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
