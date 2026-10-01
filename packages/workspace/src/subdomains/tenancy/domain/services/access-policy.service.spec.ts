import { describe, expect, it } from 'vitest';

import { AccountId } from '@intentra/shared-kernel';

import {
  Member,
  PersonalAccessToken,
  Project,
  ProjectRoleAssignment,
  Workspace,
} from '../entities/index.js';
import { ProjectRole, Role } from '../value-objects/index.js';

import { AccessPolicyService } from './access-policy.service.js';
import { WorkspaceCreationService } from './workspace-creation.service.js';

function createWorkspace(): { workspace: Workspace; owner: Member } {
  return new WorkspaceCreationService().create({
    name: 'Acme Corp',
    slug: 'acme-corp',
    accountId: new AccountId().value,
    email: 'ada@example.com',
    ownerName: 'Ada',
  });
}

function joinMember(workspace: Workspace, role: Role | null): Member {
  const member = Member.join({
    workspaceId: workspace.id.value,
    accountId: new AccountId().value,
    email: 'bob@example.com',
    name: 'bob',
  });
  member.changeRole(role);

  return member;
}

function createProject(workspace: Workspace, creator: Member): Project {
  return Project.create({
    workspaceId: workspace.id.value,
    name: 'Billing',
    slug: 'billing',
    createdBy: creator.id.value,
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

function createToken(
  workspace: Workspace,
  member: Member,
): PersonalAccessToken {
  return PersonalAccessToken.create({
    workspaceId: workspace.id.value,
    memberId: member.id.value,
    name: 'Claude Code',
    level: ProjectRole.Viewer.value,
    secretHash: 'hash',
    secretHint: 'hint',
    lifetimeDays: null,
  });
}

describe('AccessPolicyService', () => {
  const service = new AccessPolicyService();

  describe('Workspace', () => {
    it('lets an Owner manage everything in the Workspace', () => {
      // Arrange
      const { owner } = createWorkspace();

      // Act
      const answers = [
        service.canManageInvitations(owner),
        service.canManageMembers(owner),
        service.canCreateProjects(owner),
        service.canDeleteWorkspace(owner),
        service.canSeeAllPersonalAccessTokens(owner),
        service.canManageProviderKey(owner),
      ];

      // Assert
      expect(answers).toEqual([true, true, true, true, true, true]);
    });

    it('lets a Manager only create Projects', () => {
      // Arrange
      const { workspace } = createWorkspace();
      const manager = joinMember(workspace, Role.Manager);

      // Act
      const answers = [
        service.canManageInvitations(manager),
        service.canManageMembers(manager),
        service.canCreateProjects(manager),
        service.canDeleteWorkspace(manager),
        service.canSeeAllPersonalAccessTokens(manager),
        service.canManageProviderKey(manager),
      ];

      // Assert
      expect(answers).toEqual([false, false, true, false, false, false]);
    });

    it('lets a Member without a Role manage nothing', () => {
      // Arrange
      const { workspace } = createWorkspace();
      const member = joinMember(workspace, null);

      // Act
      const answers = [
        service.canManageInvitations(member),
        service.canManageMembers(member),
        service.canCreateProjects(member),
        service.canDeleteWorkspace(member),
        service.canSeeAllPersonalAccessTokens(member),
        service.canManageProviderKey(member),
      ];

      // Assert
      expect(answers).toEqual([false, false, false, false, false, false]);
    });
  });

  describe('canDeleteProject', () => {
    it('lets an Owner delete any Project', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const manager = joinMember(workspace, Role.Manager);
      const project = createProject(workspace, manager);

      // Act
      const allowed = service.canDeleteProject(owner, project);

      // Assert
      expect(allowed).toBe(true);
    });

    it('lets a Manager delete only the Projects they created', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const manager = joinMember(workspace, Role.Manager);
      const own = createProject(workspace, manager);
      const others = createProject(workspace, owner);

      // Act
      const answers = [
        service.canDeleteProject(manager, own),
        service.canDeleteProject(manager, others),
      ];

      // Assert
      expect(answers).toEqual([true, false]);
    });
  });

  describe('canChangeProjectRoles', () => {
    it('lets an Owner change Project Roles without an assignment', () => {
      // Arrange
      const { owner } = createWorkspace();

      // Act
      const allowed = service.canChangeProjectRoles(owner, null);

      // Assert
      expect(allowed).toBe(true);
    });

    it('lets only a Maintainer of the Project change Project Roles', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const member = joinMember(workspace, null);
      const project = createProject(workspace, owner);

      // Act
      const answers = [
        service.canChangeProjectRoles(
          member,
          assign(project, member, ProjectRole.Maintainer),
        ),
        service.canChangeProjectRoles(
          member,
          assign(project, member, ProjectRole.Contributor),
        ),
        service.canChangeProjectRoles(member, null),
      ];

      // Assert
      expect(answers).toEqual([true, false, false]);
    });
  });

  describe('canRevokePersonalAccessToken', () => {
    it('lets its Member or an Owner revoke a token, nobody else', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const creator = joinMember(workspace, null);
      const stranger = joinMember(workspace, Role.Manager);
      const token = createToken(workspace, creator);

      // Act
      const answers = [
        service.canRevokePersonalAccessToken(creator, token),
        service.canRevokePersonalAccessToken(owner, token),
        service.canRevokePersonalAccessToken(stranger, token),
      ];

      // Assert
      expect(answers).toEqual([true, true, false]);
    });
  });
});
