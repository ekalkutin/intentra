import { describe, expect, it } from 'vitest';

import { AccountId } from '@intentra/shared-kernel';

import { Member, Project, Workspace } from '../entities/index.js';
import {
  ProjectDeletionForbiddenException,
  ProjectSlugMismatchException,
} from '../exceptions/index.js';
import { Role } from '../value-objects/index.js';

import { ProjectDeletionService } from './project-deletion.service.js';
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

describe('ProjectDeletionService', () => {
  const service = new ProjectDeletionService();

  it('lets an Owner delete any Project after typing the slug', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const manager = joinMember(workspace, Role.Manager);
    const project = createProject(workspace, manager);

    // Act
    const deleting = () =>
      service.ensureDeletable(workspace, owner, project, { slug: 'billing' });

    // Assert
    expect(deleting).not.toThrow();
  });

  it('lets a Manager delete a Project they created', () => {
    // Arrange
    const { workspace } = createWorkspace();
    const manager = joinMember(workspace, Role.Manager);
    const project = createProject(workspace, manager);

    // Act
    const deleting = () =>
      service.ensureDeletable(workspace, manager, project, { slug: 'billing' });

    // Assert
    expect(deleting).not.toThrow();
  });

  it('rejects a Manager deleting a Project someone else created', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const manager = joinMember(workspace, Role.Manager);
    const project = createProject(workspace, owner);

    // Act
    const deleting = () =>
      service.ensureDeletable(workspace, manager, project, { slug: 'billing' });

    // Assert
    expect(deleting).toThrow(ProjectDeletionForbiddenException);
  });

  it('rejects the creator once they are no longer a Manager', () => {
    // Arrange
    const { workspace } = createWorkspace();
    const creator = joinMember(workspace, Role.Manager);
    const project = createProject(workspace, creator);
    creator.changeRole(null);

    // Act
    const deleting = () =>
      service.ensureDeletable(workspace, creator, project, { slug: 'billing' });

    // Assert
    expect(deleting).toThrow(ProjectDeletionForbiddenException);
  });

  it('rejects a slug that does not match', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const project = createProject(workspace, owner);

    // Act
    const deleting = () =>
      service.ensureDeletable(workspace, owner, project, { slug: 'bill' });

    // Assert
    expect(deleting).toThrow(ProjectSlugMismatchException);
  });
});
