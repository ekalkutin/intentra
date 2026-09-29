import { describe, expect, it } from 'vitest';

import { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import { Member, Workspace } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  NotWorkspaceOwnerException,
} from '../exceptions/index.js';

import { ProjectCreationService } from './project-creation.service.js';
import { WorkspaceCreationService } from './workspace-creation.service.js';

function createWorkspace(): { workspace: Workspace; owner: Member } {
  return new WorkspaceCreationService().create({
    name: 'Acme Corp',
    slug: 'acme-corp',
    accountId: new AccountId().value,
    email: 'member@example.com',
  });
}

function joinMember(workspaceId: WorkspaceId): Member {
  return Member.join({
    workspaceId: workspaceId.value,
    accountId: new AccountId().value,
    email: 'member@example.com',
  });
}

describe('ProjectCreationService', () => {
  const service = new ProjectCreationService();
  const props = { name: 'Billing', slug: 'billing' };

  it('lets the Owner create a Project in the Workspace', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();

    // Act
    const project = service.create(workspace, owner, props);

    // Assert
    expect(project.workspaceId.equals(workspace.id)).toBe(true);
    expect(project.createdBy.equals(owner.id)).toBe(true);
    expect(project.name.value).toBe('Billing');
    expect(project.slug.value).toBe('billing');
  });

  it('rejects a Contributor', () => {
    // Arrange
    const { workspace } = createWorkspace();
    const contributor = joinMember(workspace.id);

    // Act
    const creating = () => service.create(workspace, contributor, props);

    // Assert
    expect(creating).toThrow(NotWorkspaceOwnerException);
  });

  it('rejects a Member of another workspace', () => {
    // Arrange
    const { workspace } = createWorkspace();
    const stranger = joinMember(new WorkspaceId());

    // Act
    const creating = () => service.create(workspace, stranger, props);

    // Assert
    expect(creating).toThrow(MemberNotInWorkspaceException);
  });

  it('rejects a removed Member', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    owner.remove();

    // Act
    const creating = () => service.create(workspace, owner, props);

    // Assert
    expect(creating).toThrow(MemberNotActiveException);
  });
});
