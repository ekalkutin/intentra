import { describe, expect, it } from 'vitest';

import { AccountId } from '@intentra/shared-kernel';

import { Member, Workspace } from '../entities/index.js';
import {
  NotWorkspaceOwnerException,
  WorkspaceSlugMismatchException,
} from '../exceptions/index.js';

import { WorkspaceCreationService } from './workspace-creation.service.js';
import { WorkspaceDeletionService } from './workspace-deletion.service.js';

function createWorkspace(): { workspace: Workspace; owner: Member } {
  return new WorkspaceCreationService().create({
    name: 'Acme Corp',
    slug: 'acme-corp',
    accountId: new AccountId().value,
    email: 'ada@example.com',
    ownerName: 'Ada',
  });
}

describe('WorkspaceDeletionService', () => {
  const service = new WorkspaceDeletionService();

  it('lets the Owner delete after typing the slug', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();

    // Act
    const deleting = () =>
      service.ensureDeletable(workspace, owner, { slug: 'acme-corp' });

    // Assert
    expect(deleting).not.toThrow();
  });

  it('rejects a slug that does not match', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();

    // Act
    const deleting = () =>
      service.ensureDeletable(workspace, owner, { slug: 'acme' });

    // Assert
    expect(deleting).toThrow(WorkspaceSlugMismatchException);
  });

  it('rejects a Contributor', () => {
    // Arrange
    const { workspace } = createWorkspace();
    const contributor = Member.join({
      workspaceId: workspace.id.value,
      accountId: new AccountId().value,
      email: 'bob@example.com',
      name: 'bob',
    });

    // Act
    const deleting = () =>
      service.ensureDeletable(workspace, contributor, { slug: 'acme-corp' });

    // Assert
    expect(deleting).toThrow(NotWorkspaceOwnerException);
  });
});
