import { describe, expect, it } from 'vitest';

import { AccountId } from '@intentra/shared-kernel';

import { Member, Project, Workspace } from '../entities/index.js';
import {
  NotWorkspaceOwnerException,
  ProjectSlugMismatchException,
} from '../exceptions/index.js';

import { ProjectDeletionService } from './project-deletion.service.js';
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

describe('ProjectDeletionService', () => {
  const service = new ProjectDeletionService();

  it('lets the Owner delete after typing the slug', () => {
    // Arrange
    const { workspace, owner, project } = createWorkspace();

    // Act
    const deleting = () =>
      service.ensureDeletable(workspace, owner, project, { slug: 'billing' });

    // Assert
    expect(deleting).not.toThrow();
  });

  it('rejects a slug that does not match', () => {
    // Arrange
    const { workspace, owner, project } = createWorkspace();

    // Act
    const deleting = () =>
      service.ensureDeletable(workspace, owner, project, { slug: 'bill' });

    // Assert
    expect(deleting).toThrow(ProjectSlugMismatchException);
  });

  it('rejects a Contributor', () => {
    // Arrange
    const { workspace, project } = createWorkspace();
    const contributor = Member.join({
      workspaceId: workspace.id.value,
      accountId: new AccountId().value,
      email: 'bob@example.com',
    });

    // Act
    const deleting = () =>
      service.ensureDeletable(workspace, contributor, project, {
        slug: 'billing',
      });

    // Assert
    expect(deleting).toThrow(NotWorkspaceOwnerException);
  });
});
