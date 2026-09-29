import { describe, expect, it } from 'vitest';

import { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import { Member, Workspace } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  NotWorkspaceOwnerException,
  OwnerCannotLeaveException,
} from '../exceptions/index.js';

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

describe('MemberRemovalService', () => {
  const service = new MemberRemovalService();

  describe('remove', () => {
    it('lets the Owner remove a Member', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const member = joinMember(workspace.id);

      // Act
      service.remove(workspace, owner, member);

      // Assert
      expect(member.isActive()).toBe(false);
    });

    it('rejects a Contributor', () => {
      // Arrange
      const { workspace } = createWorkspace();
      const contributor = joinMember(workspace.id);
      const member = joinMember(workspace.id);

      // Act
      const removing = () => service.remove(workspace, contributor, member);

      // Assert
      expect(removing).toThrow(NotWorkspaceOwnerException);
    });

    it('does not remove the Owner', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();

      // Act
      const removing = () => service.remove(workspace, owner, owner);

      // Assert
      expect(removing).toThrow(OwnerCannotLeaveException);
    });

    it('does not remove a Member of another Workspace', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const stranger = joinMember(new WorkspaceId());

      // Act
      const removing = () => service.remove(workspace, owner, stranger);

      // Assert
      expect(removing).toThrow(MemberNotInWorkspaceException);
    });

    it('does not remove a Member twice', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();
      const member = joinMember(workspace.id);
      member.remove();

      // Act
      const removing = () => service.remove(workspace, owner, member);

      // Assert
      expect(removing).toThrow(MemberNotActiveException);
    });
  });

  describe('leave', () => {
    it('lets a Member leave', () => {
      // Arrange
      const { workspace } = createWorkspace();
      const member = joinMember(workspace.id);

      // Act
      service.leave(workspace, member);

      // Assert
      expect(member.isActive()).toBe(false);
    });

    it('does not let the Owner leave', () => {
      // Arrange
      const { workspace, owner } = createWorkspace();

      // Act
      const leaving = () => service.leave(workspace, owner);

      // Assert
      expect(leaving).toThrow(OwnerCannotLeaveException);
    });
  });
});
