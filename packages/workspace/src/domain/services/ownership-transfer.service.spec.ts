import { describe, expect, it } from 'vitest';

import { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import { Member, Workspace } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
} from '../exceptions/index.js';

import { OwnershipTransferService } from './ownership-transfer.service.js';
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

describe('OwnershipTransferService', () => {
  const service = new OwnershipTransferService();

  it('hands ownership to another active Member', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const contributor = joinMember(workspace.id);

    // Act
    service.transfer(workspace, contributor);

    // Assert
    expect(workspace.isOwnedBy(contributor.id)).toBe(true);
    expect(workspace.isOwnedBy(owner.id)).toBe(false);
  });

  it('rejects a Member of another workspace', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const stranger = joinMember(new WorkspaceId());

    // Act
    const transferring = () => service.transfer(workspace, stranger);

    // Assert
    expect(transferring).toThrow(MemberNotInWorkspaceException);
    expect(workspace.isOwnedBy(owner.id)).toBe(true);
  });

  it('rejects a removed Member', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const former = joinMember(workspace.id);
    former.remove();

    // Act
    const transferring = () => service.transfer(workspace, former);

    // Assert
    expect(transferring).toThrow(MemberNotActiveException);
    expect(workspace.isOwnedBy(owner.id)).toBe(true);
  });
});
