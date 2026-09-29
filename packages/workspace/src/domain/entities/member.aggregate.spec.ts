import { describe, expect, it } from 'vitest';

import { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import { AlreadyWorkspaceMemberException } from '../exceptions/index.js';
import { MemberId, MemberStatus, Role } from '../value-objects/index.js';

import { Member } from './member.aggregate.js';

describe('Member', () => {
  const workspaceId = new WorkspaceId();

  function join(): Member {
    return Member.join({
      workspaceId: workspaceId.value,
      accountId: new AccountId().value,
      email: 'member@example.com',
    });
  }

  it('joins as an active Contributor', () => {
    // Arrange
    const accountId = new AccountId();

    // Act
    const member = Member.join({
      workspaceId: workspaceId.value,
      accountId: accountId.value,
      email: 'member@example.com',
    });

    // Assert
    expect(member.role).toBe(Role.Contributor);
    expect(member.isActive()).toBe(true);
    expect(member.belongsTo(workspaceId)).toBe(true);
    expect(member.accountId.equals(accountId)).toBe(true);
  });

  it('creates the Owner with the id the Workspace already refers to', () => {
    // Arrange
    const id = new MemberId();

    // Act
    const owner = Member.createOwner({
      id: id.value,
      workspaceId: workspaceId.value,
      accountId: new AccountId().value,
      email: 'member@example.com',
    });

    // Assert
    expect(owner.id.equals(id)).toBe(true);
    expect(owner.role).toBe(Role.Contributor);
    expect(owner.isActive()).toBe(true);
  });

  it('does not belong to another workspace', () => {
    // Arrange
    const member = join();

    // Act
    const belongs = member.belongsTo(new WorkspaceId());

    // Assert
    expect(belongs).toBe(false);
  });

  it('loses access once removed, and removing again changes nothing', () => {
    // Arrange
    const member = join();
    member.remove();

    // Act
    member.remove();

    // Assert
    expect(member.isActive()).toBe(false);
    expect(member.status).toBe(MemberStatus.Removed);
  });

  it('comes back as Active when a Removed Member rejoins', () => {
    // Arrange
    const member = join();
    member.remove();

    // Act
    member.rejoin();

    // Assert
    expect(member.isActive()).toBe(true);
  });

  it('does not rejoin while still Active', () => {
    // Arrange
    const member = join();

    // Act
    const rejoining = () => member.rejoin();

    // Assert
    expect(rejoining).toThrow(AlreadyWorkspaceMemberException);
  });
});
