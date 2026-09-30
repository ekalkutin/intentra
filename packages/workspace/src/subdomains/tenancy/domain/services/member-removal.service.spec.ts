import { describe, expect, it } from 'vitest';

import { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import { Member, Workspace } from '../entities/index.js';
import {
  LastOwnerCannotLeaveException,
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  NotWorkspaceOwnerException,
} from '../exceptions/index.js';
import { Role } from '../value-objects/index.js';

import { MemberRemovalService } from './member-removal.service.js';
import { WorkspaceCreationService } from './workspace-creation.service.js';

function createWorkspace(): { workspace: Workspace; owner: Member } {
  return new WorkspaceCreationService().create({
    name: 'Acme Corp',
    slug: 'acme-corp',
    accountId: new AccountId().value,
    email: 'ada@example.com',
  });
}

function joinMember(workspaceId: WorkspaceId): Member {
  return Member.join({
    workspaceId: workspaceId.value,
    accountId: new AccountId().value,
    email: 'bob@example.com',
  });
}

function joinOwner(workspaceId: WorkspaceId): Member {
  const member = joinMember(workspaceId);
  member.changeRole(Role.Owner);

  return member;
}

describe('MemberRemovalService', () => {
  const service = new MemberRemovalService();

  describe('remove', () => {
    it('lets an Owner remove a Member', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const member = joinMember(workspace.id);

      // Act
      service.remove(workspace, owner, member, { owners: [owner] });

      // Assert
      expect(member.isActive()).toBe(false);
    });

    it('lets an Owner remove another Owner', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const other = joinOwner(workspace.id);

      // Act
      service.remove(workspace, owner, other, { owners: [owner, other] });

      // Assert
      expect(other.isActive()).toBe(false);
      expect(other.role).toBeNull();
    });

    it('rejects a Member without a Role', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const remover = joinMember(workspace.id);
      const member = joinMember(workspace.id);

      // Act
      const removing = () =>
        service.remove(workspace, remover, member, { owners: [owner] });

      // Assert
      expect(removing).toThrow(NotWorkspaceOwnerException);
    });

    it('does not remove the last Owner', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();

      // Act
      const removing = () =>
        service.remove(workspace, owner, owner, { owners: [owner] });

      // Assert
      expect(removing).toThrow(LastOwnerCannotLeaveException);
    });

    it('does not remove a Member of another Workspace', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const stranger = joinMember(new WorkspaceId());

      // Act
      const removing = () =>
        service.remove(workspace, owner, stranger, { owners: [owner] });

      // Assert
      expect(removing).toThrow(MemberNotInWorkspaceException);
    });

    it('does not remove a Member twice', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const member = joinMember(workspace.id);
      member.remove();

      // Act
      const removing = () =>
        service.remove(workspace, owner, member, { owners: [owner] });

      // Assert
      expect(removing).toThrow(MemberNotActiveException);
    });
  });

  describe('leave', () => {
    it('lets a Member leave', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const member = joinMember(workspace.id);

      // Act
      service.leave(workspace, member, { owners: [owner] });

      // Assert
      expect(member.isActive()).toBe(false);
    });

    it('lets an Owner leave while another Owner stays', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const other = joinOwner(workspace.id);

      // Act
      service.leave(workspace, owner, { owners: [owner, other] });

      // Assert
      expect(owner.isActive()).toBe(false);
    });

    it('does not let the last Owner leave', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();

      // Act
      const leaving = () =>
        service.leave(workspace, owner, { owners: [owner] });

      // Assert
      expect(leaving).toThrow(LastOwnerCannotLeaveException);
    });
  });
});
