import { describe, expect, it } from 'vitest';

import { AccountId, Timestamp } from '@intentra/shared';

import { PersonalAccessTokenName } from '../value-objects/index.js';

import { PersonalAccessToken } from './personal-access-token.aggregate.js';

const NOW = Timestamp.from('2026-01-01T00:00:00Z');
const LATER = Timestamp.from('2026-02-01T00:00:00Z');

function issue(expiresAt: Timestamp | null): PersonalAccessToken {
  return PersonalAccessToken.issue(
    {
      accountId: new AccountId(),
      name: new PersonalAccessTokenName('Claude Desktop'),
      secretHash: 'hash',
      expiresAt,
    },
    NOW,
  );
}

describe('PersonalAccessToken', () => {
  it('without an expiry stays active', () => {
    expect(issue(null).isActive(LATER)).toBe(true);
  });

  it('is not active once it expires', () => {
    const token = issue(Timestamp.from('2026-01-15T00:00:00Z'));

    expect(token.isActive(NOW)).toBe(true);
    expect(token.isActive(LATER)).toBe(false);
  });

  it('is not active once revoked, and keeps the first revocation time', () => {
    const token = issue(null);

    token.revoke(NOW);
    token.revoke(LATER);

    expect(token.isActive(NOW)).toBe(false);
    expect(token.revokedAt).toEqual(NOW);
  });
});
