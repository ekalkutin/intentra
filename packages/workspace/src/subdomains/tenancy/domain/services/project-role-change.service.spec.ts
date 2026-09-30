import { describe, expect, it } from 'vitest';

import { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import {
  Member,
  Project,
  ProjectRoleAssignment,
  Workspace,
} from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  OwnerProjectRoleFixedException,
  ProjectRoleChangeForbiddenException,
} from '../exceptions/index.js';
import { ProjectRole, Role } from '../value-objects/index.js';

import { ProjectRoleChangeService } from './project-role-change.service.js';
import { WorkspaceCreationService } from './workspace-creation.service.js';

function createWorkspace(): {
  workspace: Workspace;
  owner: Member;
  project: Project;
} {
  const { workspace, owner } = new WorkspaceCreationService().create({
    name: 'Acme Corp',
    slug: 'acme-corp',
    accountId: new AccountId().value,
    email: 'ada@example.com',
  });
  const project = Project.create({
    workspaceId: workspace.id.value,
    name: 'Billing',
    slug: 'billing',
    createdBy: owner.id.value,
  });

  return { workspace, owner, project };
}

function joinMember(workspaceId: WorkspaceId): Member {
  return Member.join({
    workspaceId: workspaceId.value,
    accountId: new AccountId().value,
    email: 'bob@example.com',
  });
}

function assign(
  project: Project,
  member: Member,
  role: ProjectRole,
): ProjectRoleAssignment {
  return ProjectRoleAssignment.create({
    workspaceId: project.workspaceId.value,
    projectId: project.id.value,
    memberId: member.id.value,
    role: role.value,
  });
}

describe('ProjectRoleChangeService', () => {
  const service = new ProjectRoleChangeService();

  it('lets an Owner give a Member a Project Role', () => {
    // Arrange
    const { workspace, owner, project } = createWorkspace();
    const member = joinMember(workspace.id);

    // Act
    const assignment = service.change(project, owner, member, {
      role: ProjectRole.Contributor,
      changerAssignment: null,
      assignment: null,
    });

    // Assert
    expect(assignment.role).toBe(ProjectRole.Contributor);
    expect(assignment.projectId.equals(project.id)).toBe(true);
    expect(assignment.memberId.equals(member.id)).toBe(true);
  });

  it('changes an existing assignment', () => {
    // Arrange
    const { workspace, owner, project } = createWorkspace();
    const member = joinMember(workspace.id);
    const existing = assign(project, member, ProjectRole.Contributor);

    // Act
    const assignment = service.change(project, owner, member, {
      role: ProjectRole.Maintainer,
      changerAssignment: null,
      assignment: existing,
    });

    // Assert
    expect(assignment).toBe(existing);
    expect(existing.role).toBe(ProjectRole.Maintainer);
  });

  it('lets a Maintainer of the Project change Project Roles', () => {
    // Arrange
    const { workspace, project } = createWorkspace();
    const maintainer = joinMember(workspace.id);
    const member = joinMember(workspace.id);

    // Act
    const assignment = service.change(project, maintainer, member, {
      role: ProjectRole.Contributor,
      changerAssignment: assign(project, maintainer, ProjectRole.Maintainer),
      assignment: null,
    });

    // Assert
    expect(assignment.role).toBe(ProjectRole.Contributor);
  });

  it('rejects a Contributor of the Project', () => {
    // Arrange
    const { workspace, project } = createWorkspace();
    const contributor = joinMember(workspace.id);
    const member = joinMember(workspace.id);

    // Act
    const changing = () =>
      service.change(project, contributor, member, {
        role: ProjectRole.Contributor,
        changerAssignment: assign(
          project,
          contributor,
          ProjectRole.Contributor,
        ),
        assignment: null,
      });

    // Assert
    expect(changing).toThrow(ProjectRoleChangeForbiddenException);
  });

  it('rejects a Manager who is only a Viewer of the Project', () => {
    // Arrange
    const { workspace, project } = createWorkspace();
    const manager = joinMember(workspace.id);
    manager.changeRole(Role.Manager);
    const member = joinMember(workspace.id);

    // Act
    const changing = () =>
      service.change(project, manager, member, {
        role: ProjectRole.Contributor,
        changerAssignment: null,
        assignment: null,
      });

    // Assert
    expect(changing).toThrow(ProjectRoleChangeForbiddenException);
  });

  it("does not change an Owner's Project Role", () => {
    // Arrange
    const { workspace, owner, project } = createWorkspace();
    const other = joinMember(workspace.id);
    other.changeRole(Role.Owner);

    // Act
    const changing = () =>
      service.change(project, owner, other, {
        role: ProjectRole.Viewer,
        changerAssignment: null,
        assignment: null,
      });

    // Assert
    expect(changing).toThrow(OwnerProjectRoleFixedException);
  });

  it('rejects a Member of another Workspace', () => {
    // Arrange
    const { owner, project } = createWorkspace();
    const stranger = joinMember(new WorkspaceId());

    // Act
    const changing = () =>
      service.change(project, owner, stranger, {
        role: ProjectRole.Contributor,
        changerAssignment: null,
        assignment: null,
      });

    // Assert
    expect(changing).toThrow(MemberNotInWorkspaceException);
  });

  it('rejects a Removed Member', () => {
    // Arrange
    const { workspace, owner, project } = createWorkspace();
    const former = joinMember(workspace.id);
    former.remove();

    // Act
    const changing = () =>
      service.change(project, owner, former, {
        role: ProjectRole.Contributor,
        changerAssignment: null,
        assignment: null,
      });

    // Assert
    expect(changing).toThrow(MemberNotActiveException);
  });
});
