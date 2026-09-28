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
  });
}

function joinMember(workspaceId: WorkspaceId): Member {
  return Member.join({
    workspaceId: workspaceId.value,
    accountId: new AccountId().value,
  });
}

describe('OwnershipTransferService', () => {
  const service = new OwnershipTransferService();

  it('hands ownership to another active Member', () => {
    const { workspace, owner } = createWorkspace();
    const contributor = joinMember(workspace.id);

    service.transfer(workspace, contributor);

    expect(workspace.isOwnedBy(contributor.id)).toBe(true);
    expect(workspace.isOwnedBy(owner.id)).toBe(false);
  });

  it('rejects a Member of another workspace', () => {
    const { workspace, owner } = createWorkspace();
    const stranger = joinMember(new WorkspaceId());

    expect(() => service.transfer(workspace, stranger)).toThrow(
      MemberNotInWorkspaceException,
    );
    expect(workspace.isOwnedBy(owner.id)).toBe(true);
  });

  it('rejects a removed Member', () => {
    const { workspace, owner } = createWorkspace();
    const former = joinMember(workspace.id);
    former.remove();

    expect(() => service.transfer(workspace, former)).toThrow(
      MemberNotActiveException,
    );
    expect(workspace.isOwnedBy(owner.id)).toBe(true);
  });
});
