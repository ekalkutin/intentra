import { describe, expect, it } from 'vitest';

import { AccountId, ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { Member, ProjectRoleAssignment } from '../entities/index.js';
import { ProjectRole, Role } from '../value-objects/index.js';

import { ProjectRoleResolutionService } from './project-role-resolution.service.js';

describe('ProjectRoleResolutionService', () => {
  const service = new ProjectRoleResolutionService();
  const workspaceId = new WorkspaceId();

  function joinMember(): Member {
    return Member.join({
      workspaceId: workspaceId.value,
      accountId: new AccountId().value,
      email: 'bob@example.com',
    });
  }

  function assign(member: Member, role: ProjectRole): ProjectRoleAssignment {
    return ProjectRoleAssignment.create({
      workspaceId: workspaceId.value,
      projectId: new ProjectId().value,
      memberId: member.id.value,
      role: role.value,
    });
  }

  it('makes a Member without an assignment a Viewer', () => {
    // Arrange
    const member = joinMember();

    // Act
    const role = service.resolve(member, null);

    // Assert
    expect(role).toBe(ProjectRole.Viewer);
  });

  it('takes the assigned Project Role', () => {
    // Arrange
    const member = joinMember();
    const assignment = assign(member, ProjectRole.Contributor);

    // Act
    const role = service.resolve(member, assignment);

    // Assert
    expect(role).toBe(ProjectRole.Contributor);
  });

  it('makes an Owner a Maintainer whatever is assigned', () => {
    // Arrange
    const owner = joinMember();
    owner.changeRole(Role.Owner);
    const assignment = assign(owner, ProjectRole.Viewer);

    // Act
    const role = service.resolve(owner, assignment);

    // Assert
    expect(role).toBe(ProjectRole.Maintainer);
  });
});
