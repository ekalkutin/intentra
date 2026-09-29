import { describe, expect, it } from 'vitest';

import { AccountId } from '@intentra/shared-kernel';

import { Member, PersonalAccessToken, Workspace } from '../entities/index.js';
import { PersonalAccessTokenRevocationForbiddenException } from '../exceptions/index.js';

import { PersonalAccessTokenCreationService } from './personal-access-token-creation.service.js';
import { PersonalAccessTokenRevocationService } from './personal-access-token-revocation.service.js';
import { WorkspaceCreationService } from './workspace-creation.service.js';

function createWorkspace(): { workspace: Workspace; owner: Member } {
  return new WorkspaceCreationService().create({
    name: 'Acme Corp',
    slug: 'acme-corp',
    accountId: new AccountId().value,
    email: 'ada@example.com',
  });
}

function joinMember(workspace: Workspace): Member {
  return Member.join({
    workspaceId: workspace.id.value,
    accountId: new AccountId().value,
    email: 'bob@example.com',
  });
}

function createToken(
  workspace: Workspace,
  creator: Member,
): PersonalAccessToken {
  return new PersonalAccessTokenCreationService().create(workspace, creator, {
    name: 'Claude Code',
    level: 'contributor',
    secretHash: 'hash',
    secretHint: 'intr_…hash',
    lifetimeDays: 90,
  });
}

describe('PersonalAccessTokenRevocationService', () => {
  const service = new PersonalAccessTokenRevocationService();

  it('lets a Member revoke their own token', () => {
    // Arrange
    const { workspace } = createWorkspace();
    const member = joinMember(workspace);
    const token = createToken(workspace, member);

    // Act
    const revoking = () => service.ensureRevocable(workspace, member, token);

    // Assert
    expect(revoking).not.toThrow();
  });

  it("lets an Owner revoke another Member's token", () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const token = createToken(workspace, joinMember(workspace));

    // Act
    const revoking = () => service.ensureRevocable(workspace, owner, token);

    // Assert
    expect(revoking).not.toThrow();
  });

  it("rejects a Member revoking someone else's token", () => {
    // Arrange
    const { workspace, owner } = createWorkspace();
    const member = joinMember(workspace);
    const token = createToken(workspace, owner);

    // Act
    const revoking = () => service.ensureRevocable(workspace, member, token);

    // Assert
    expect(revoking).toThrow(PersonalAccessTokenRevocationForbiddenException);
  });
});
