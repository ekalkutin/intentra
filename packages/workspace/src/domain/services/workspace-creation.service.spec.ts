import { describe, expect, it } from 'vitest';

import { AccountId } from '@intentra/shared-kernel';

import { InvalidWorkspaceSlugException } from '../exceptions/index.js';

import { WorkspaceCreationService } from './workspace-creation.service.js';

describe('WorkspaceCreationService', () => {
  const service = new WorkspaceCreationService();

  it('makes the creating Account the Owner of the new Workspace', () => {
    // Arrange
    const accountId = new AccountId();

    // Act
    const { workspace, owner } = service.create({
      name: 'Acme Corp',
      slug: 'acme-corp',
      accountId: accountId.value,
      email: 'member@example.com',
    });

    // Assert
    expect(owner.isOwner()).toBe(true);
    expect(owner.belongsTo(workspace.id)).toBe(true);
    expect(owner.accountId.equals(accountId)).toBe(true);
    expect(owner.isActive()).toBe(true);
  });

  it('rejects an invalid Workspace', () => {
    // Act
    const creating = () =>
      service.create({
        name: 'Acme Corp',
        slug: 'Acme Corp',
        accountId: new AccountId().value,
        email: 'member@example.com',
      });

    // Assert
    expect(creating).toThrow(InvalidWorkspaceSlugException);
  });
});
