import { describe, expect, it } from 'vitest';

import { Scope } from '@intentra/shared';

import { ProjectRoles, WorkspaceRoles } from '../value-objects/index.js';

import { RoleAssignment } from './role-assignment.js';

describe('RoleAssignment', () => {
  const workspaceId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const projectId = crypto.randomUUID();

  it('выдаёт роль workspace на workspace', () => {
    const assignment = RoleAssignment.create({
      workspaceId,
      accountId,
      role: WorkspaceRoles.Owner,
      scope: Scope.workspace(workspaceId),
    });

    expect(assignment.scope.toString()).toBe(`workspace:${workspaceId}`);
  });

  it('не выдаёт роль проекта на workspace', () => {
    expect(() =>
      RoleAssignment.create({
        workspaceId,
        accountId,
        role: ProjectRoles.Editor,
        scope: Scope.workspace(workspaceId),
      }),
    ).toThrow(/cannot be granted on a workspace/);
  });

  it('не выдаёт роль workspace на проекте', () => {
    expect(() =>
      RoleAssignment.create({
        workspaceId,
        accountId,
        role: WorkspaceRoles.Member,
        scope: Scope.project(projectId),
      }),
    ).toThrow(/cannot be granted on a project/);
  });

  it('не выражает платформенные полномочия', () => {
    expect(() =>
      RoleAssignment.create({
        workspaceId,
        accountId,
        role: WorkspaceRoles.Owner,
        scope: Scope.platform(),
      }),
    ).toThrow(/PlatformRole/);
  });
});
