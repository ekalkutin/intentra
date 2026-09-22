import { describe, expect, it } from 'vitest';

import {
  Permissions,
  ProjectRoles,
  WorkspaceRoles,
  type Role,
} from '../../subdomains/access/domain/value-objects/index.js';

import { ActingMember } from './acting-member.js';

const workspaceId = crypto.randomUUID();
const accountId = crypto.randomUUID();
const projectId = crypto.randomUUID();
const otherProjectId = crypto.randomUUID();

function member(
  workspaceRoles: Role[],
  projectRoles: Array<[string, Role[]]> = [],
  isPlatformAdmin = false,
): ActingMember {
  return ActingMember.of({
    workspaceId,
    accountId,
    isPlatformAdmin,
    workspaceRoles,
    projectRoles: new Map(projectRoles),
  });
}

describe('ActingMember', () => {
  it('владелец проходит любую проверку внутри workspace', () => {
    const owner = member([WorkspaceRoles.Owner]);

    expect(owner.isOmnipotent).toBe(true);
    expect(owner.can(Permissions.ProjectsCreate)).toBe(true);
    expect(owner.canInProject(projectId, Permissions.ProjectWrite)).toBe(true);
  });

  it('участник без выданных ролей не может ничего', () => {
    const plain = member([WorkspaceRoles.Member]);

    expect(plain.isOmnipotent).toBe(false);
    expect(plain.can(Permissions.ProjectsCreate)).toBe(false);
    expect(plain.canInProject(projectId, Permissions.ProjectRead)).toBe(false);
  });

  it('роль на проекте действует только на нём', () => {
    const editor = member(
      [WorkspaceRoles.Member],
      [[projectId, [ProjectRoles.Editor]]],
    );

    expect(editor.canInProject(projectId, Permissions.ProjectWrite)).toBe(true);
    expect(editor.canInProject(otherProjectId, Permissions.ProjectWrite)).toBe(
      false,
    );
    expect(editor.reachableProjectIds).toEqual([projectId]);
  });

  it('читатель проекта не может в нём писать', () => {
    const viewer = member(
      [WorkspaceRoles.Member],
      [[projectId, [ProjectRoles.Viewer]]],
    );

    expect(viewer.canInProject(projectId, Permissions.ProjectRead)).toBe(true);
    expect(viewer.canInProject(projectId, Permissions.ProjectWrite)).toBe(
      false,
    );
  });

  it('платформенный администратор всесилен, не состоя в workspace', () => {
    const admin = member([], [], true);

    expect(admin.isOmnipotent).toBe(true);
    expect(admin.can(Permissions.MembersManage)).toBe(true);
  });
});
