import { describe, expect, it } from 'vitest';

import { WorkspaceId } from '@intentra/shared-kernel';

import {
  InvalidPersonalAccessTokenLifetimeException,
  InvalidPersonalAccessTokenNameException,
  UnknownProjectRoleException,
} from '../exceptions/index.js';
import {
  MemberId,
  PersonalAccessTokenId,
  ProjectRole,
} from '../value-objects/index.js';

import { PersonalAccessToken } from './personal-access-token.aggregate.js';

function create(
  overrides: Partial<Parameters<typeof PersonalAccessToken.create>[0]> = {},
): PersonalAccessToken {
  return PersonalAccessToken.create({
    workspaceId: new WorkspaceId().value,
    memberId: new MemberId().value,
    name: 'Claude Code',
    level: 'contributor',
    secretHash: 'hash',
    secretHint: 'intr_…hash',
    lifetimeDays: 90,
    ...overrides,
  });
}

describe('PersonalAccessToken', () => {
  it('expires after the chosen number of days', () => {
    // Act
    const token = create({ lifetimeDays: 30 });

    // Assert
    const lifetime = token.createdAt.until(token.expiresAt!);
    expect(lifetime.total('hours')).toBe(30 * 24);
    expect(token.level).toBe(ProjectRole.Contributor);
    expect(token.lastUsedAt).toBeNull();
    expect(token.isExpired()).toBe(false);
  });

  it('never expires without a lifetime', () => {
    // Act
    const token = create({ lifetimeDays: null });

    // Assert
    expect(token.expiresAt).toBeNull();
    expect(token.isExpired()).toBe(false);
  });

  it('is expired once its expiry has passed', () => {
    // Arrange
    const past = Temporal.Now.instant().subtract({ hours: 1 });

    // Act
    const token = PersonalAccessToken.restore({
      id: new PersonalAccessTokenId().value,
      workspaceId: new WorkspaceId().value,
      memberId: new MemberId().value,
      name: 'Claude Code',
      level: 'viewer',
      secretHash: 'hash',
      secretHint: 'intr_…hash',
      createdAt: past.subtract({ hours: 24 }),
      expiresAt: past,
      lastUsedAt: null,
    });

    // Assert
    expect(token.isExpired()).toBe(true);
  });

  it('records when it was last used', () => {
    // Arrange
    const token = create();

    // Act
    token.markUsed();

    // Assert
    expect(token.lastUsedAt).not.toBeNull();
  });

  it('rejects a lifetime that is not offered', () => {
    // Act
    const creating = () => create({ lifetimeDays: 7 });

    // Assert
    expect(creating).toThrow(InvalidPersonalAccessTokenLifetimeException);
  });

  it('rejects an empty name', () => {
    // Act
    const creating = () => create({ name: ' ' });

    // Assert
    expect(creating).toThrow(InvalidPersonalAccessTokenNameException);
  });

  it('rejects an unknown level', () => {
    // Act
    const creating = () => create({ level: 'owner' });

    // Assert
    expect(creating).toThrow(UnknownProjectRoleException);
  });
});
