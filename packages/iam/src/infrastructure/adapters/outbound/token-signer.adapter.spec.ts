import { JwtService } from '@nestjs/jwt';
import { describe, expect, it } from 'vitest';

import { AccountId } from '@intentra/shared-kernel';

import { TokenSignerAdapter } from './token-signer.adapter.js';

describe('TokenSignerAdapter', () => {
  const options = {
    accessTokenSecret: 'test-access-secret',
    refreshTokenSecret: 'test-refresh-secret',
    accessTokenTtlSeconds: 900,
    refreshTokenTtlSeconds: 604800,
  };
  const signer = new TokenSignerAdapter(new JwtService(), options);
  const claims = { accountId: new AccountId().value, email: 'ada@example.com' };

  it('reads back the claims of an access token', async () => {
    const token = await signer.signAccessToken(claims);

    await expect(signer.verifyAccessToken(token)).resolves.toEqual(claims);
  });

  it('reads back the Account of a refresh token', async () => {
    const token = await signer.signRefreshToken({
      accountId: claims.accountId,
    });

    await expect(signer.verifyRefreshToken(token)).resolves.toEqual({
      accountId: claims.accountId,
    });
  });

  it('does not accept a refresh token as an access token, nor the other way round', async () => {
    const accessToken = await signer.signAccessToken(claims);
    const refreshToken = await signer.signRefreshToken({
      accountId: claims.accountId,
    });

    await expect(signer.verifyAccessToken(refreshToken)).resolves.toBeNull();
    await expect(signer.verifyRefreshToken(accessToken)).resolves.toBeNull();
  });

  it('rejects a token signed with another secret', async () => {
    const forger = new TokenSignerAdapter(new JwtService(), {
      ...options,
      accessTokenSecret: 'another-secret',
    });
    const token = await forger.signAccessToken(claims);

    await expect(signer.verifyAccessToken(token)).resolves.toBeNull();
  });

  it('rejects an expired token', async () => {
    const expiring = new TokenSignerAdapter(new JwtService(), {
      ...options,
      accessTokenTtlSeconds: -1,
    });
    const token = await expiring.signAccessToken(claims);

    await expect(signer.verifyAccessToken(token)).resolves.toBeNull();
  });

  it('rejects garbage', async () => {
    await expect(signer.verifyAccessToken('not-a-jwt')).resolves.toBeNull();
  });
});
