import { describe, expect, it } from 'vitest';

import { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import {
  AlreadyWorkspaceMemberException,
  MemberNotActiveException,
  MemberNotInWorkspaceException,
} from '../exceptions/index.js';
import { MemberStatus, Role } from '../value-objects/index.js';

import { Member } from './member.aggregate.js';

describe('Member', () => {
  const workspaceId = new WorkspaceId();

  function join(): Member {
    return Member.join({
      workspaceId: workspaceId.value,
      accountId: new AccountId().value,
      email: 'member@example.com',
      name: 'member',
    });
  }

  it('joins as an active Member without a Role', () => {
    // Arrange
    const accountId = new AccountId();

    // Act
    const member = Member.join({
      workspaceId: workspaceId.value,
      accountId: accountId.value,
      email: 'member@example.com',
      name: 'member',
    });

    // Assert
    expect(member.role).toBeNull();
    expect(member.isOwner()).toBe(false);
    expect(member.isActive()).toBe(true);
    expect(member.belongsTo(workspaceId)).toBe(true);
    expect(member.accountId.equals(accountId)).toBe(true);
  });

  it('creates an active Owner', () => {
    // Act
    const owner = Member.createOwner({
      workspaceId: workspaceId.value,
      accountId: new AccountId().value,
      email: 'member@example.com',
      name: 'member',
    });

    // Assert
    expect(owner.role).toBe(Role.Owner);
    expect(owner.isOwner()).toBe(true);
    expect(owner.isActive()).toBe(true);
  });

  it('changes its Role', () => {
    // Arrange
    const member = join();

    // Act
    member.changeRole(Role.Owner);

    // Assert
    expect(member.isOwner()).toBe(true);
  });

  it('loses its Role once removed and rejoins without one', () => {
    // Arrange
    const member = join();
    member.changeRole(Role.Owner);

    // Act
    member.remove();
    member.rejoin();

    // Assert
    expect(member.role).toBeNull();
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

  it('is active in its own Workspace', () => {
    // Arrange
    const member = join();

    // Act
    const ensuring = () => member.ensureActiveIn(workspaceId);

    // Assert
    expect(ensuring).not.toThrow();
  });

  it('is not active in another Workspace', () => {
    // Arrange
    const member = join();

    // Act
    const ensuring = () => member.ensureActiveIn(new WorkspaceId());

    // Assert
    expect(ensuring).toThrow(MemberNotInWorkspaceException);
  });

  it('is not active once removed', () => {
    // Arrange
    const member = join();
    member.remove();

    // Act
    const ensuring = () => member.ensureActiveIn(workspaceId);

    // Assert
    expect(ensuring).toThrow(MemberNotActiveException);
  });
});
