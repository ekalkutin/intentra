import { describe, expect, it } from 'vitest';

import { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import { Member, Workspace } from '../entities/index.js';
import {
  LastOwnerCannotStepDownException,
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  NotWorkspaceOwnerException,
} from '../exceptions/index.js';
import { Role } from '../value-objects/index.js';

import { RoleChangeService } from './role-change.service.js';
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

function joinMember(workspaceId: WorkspaceId): Member {
  return Member.join({
    workspaceId: workspaceId.value,
    accountId: new AccountId().value,
    email: 'bob@example.com',
    name: 'bob',
  });
}

describe('RoleChangeService', () => {
  const service = new RoleChangeService();

  it('lets an Owner make another Member an Owner', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const member = joinMember(workspace.id);

    // Act
    service.change(workspace, owner, member, {
      role: Role.Owner,
      owners: [owner],
    });

    // Assert
    expect(member.isOwner()).toBe(true);
    expect(owner.isOwner()).toBe(true);
  });

  it('lets an Owner step down while another Owner stays', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const other = joinMember(workspace.id);
    other.changeRole(Role.Owner);

    // Act
    service.change(workspace, owner, owner, {
      role: null,
      owners: [owner, other],
    });

    // Assert
    expect(owner.role).toBeNull();
  });

  it('does not let the last Owner step down', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();

    // Act
    const changing = () =>
      service.change(workspace, owner, owner, { role: null, owners: [owner] });

    // Assert
    expect(changing).toThrow(LastOwnerCannotStepDownException);
    expect(owner.isOwner()).toBe(true);
  });

  it('lets the last Owner keep the Owner Role', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();

    // Act
    service.change(workspace, owner, owner, {
      role: Role.Owner,
      owners: [owner],
    });

    // Assert
    expect(owner.isOwner()).toBe(true);
  });

  it('rejects a Member without a Role', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const changer = joinMember(workspace.id);

    // Act
    const changing = () =>
      service.change(workspace, changer, changer, {
        role: Role.Owner,
        owners: [owner],
      });

    // Assert
    expect(changing).toThrow(NotWorkspaceOwnerException);
    expect(changer.isOwner()).toBe(false);
  });

  it('rejects a Member of another Workspace', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const stranger = joinMember(new WorkspaceId());

    // Act
    const changing = () =>
      service.change(workspace, owner, stranger, {
        role: Role.Owner,
        owners: [owner],
      });

    // Assert
    expect(changing).toThrow(MemberNotInWorkspaceException);
  });

  it('rejects a Removed Member', () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const former = joinMember(workspace.id);
    former.remove();

    // Act
    const changing = () =>
      service.change(workspace, owner, former, {
        role: Role.Owner,
        owners: [owner],
      });

    // Assert
    expect(changing).toThrow(MemberNotActiveException);
  });
});
