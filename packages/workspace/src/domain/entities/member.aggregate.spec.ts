import { describe, expect, it } from 'vitest';

import { AccountId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId, MemberStatus, Role } from '../value-objects/index.js';

import { Member } from './member.aggregate.js';

describe('Member', () => {
  const workspaceId = new WorkspaceId();

  function join(): Member {
    return Member.join({
      workspaceId: workspaceId.value,
      accountId: new AccountId().value,
    });
  }

  it('joins as an active Contributor', () => {
    const accountId = new AccountId();

    const member = Member.join({
      workspaceId: workspaceId.value,
      accountId: accountId.value,
    });

    expect(member.role).toBe(Role.Contributor);
    expect(member.isActive()).toBe(true);
    expect(member.belongsTo(workspaceId)).toBe(true);
    expect(member.accountId.equals(accountId)).toBe(true);
  });

  it('creates the Owner with the id the Workspace already refers to', () => {
    const id = new MemberId();

    const owner = Member.createOwner({
      id: id.value,
      workspaceId: workspaceId.value,
      accountId: new AccountId().value,
    });

    expect(owner.id.equals(id)).toBe(true);
    expect(owner.role).toBe(Role.Contributor);
    expect(owner.isActive()).toBe(true);
  });

  it('does not belong to another workspace', () => {
    const member = join();

    expect(member.belongsTo(new WorkspaceId())).toBe(false);
  });

  it('loses access once removed, and removing again changes nothing', () => {
    const member = join();

    member.remove();
    member.remove();

    expect(member.isActive()).toBe(false);
    expect(member.status).toBe(MemberStatus.Removed);
  });
});
