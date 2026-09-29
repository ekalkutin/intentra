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
    // Arrange
    const token = await signer.signAccessToken(claims);

    // Act
    const verified = await signer.verifyAccessToken(token);

    // Assert
    expect(verified).toEqual(claims);
  });

  it('reads back the Account of a refresh token', async () => {
    // Arrange
    const token = await signer.signRefreshToken({
      accountId: claims.accountId,
    });

    // Act
    const verified = await signer.verifyRefreshToken(token);

    // Assert
    expect(verified).toEqual({ accountId: claims.accountId });
  });

  it('does not accept a refresh token as an access token, nor the other way round', async () => {
    // Arrange
    const accessToken = await signer.signAccessToken(claims);
    const refreshToken = await signer.signRefreshToken({
      accountId: claims.accountId,
    });

    // Act
    const [refreshAsAccess, accessAsRefresh] = await Promise.all([
      signer.verifyAccessToken(refreshToken),
      signer.verifyRefreshToken(accessToken),
    ]);

    // Assert
    expect(refreshAsAccess).toBeNull();
    expect(accessAsRefresh).toBeNull();
  });

  it('rejects a token signed with another secret', async () => {
    // Arrange
    const forger = new TokenSignerAdapter(new JwtService(), {
      ...options,
      accessTokenSecret: 'another-secret',
    });
    const token = await forger.signAccessToken(claims);

    // Act
    const verified = await signer.verifyAccessToken(token);

    // Assert
    expect(verified).toBeNull();
  });

  it('rejects an expired token', async () => {
    // Arrange
    const expiring = new TokenSignerAdapter(new JwtService(), {
      ...options,
      accessTokenTtlSeconds: -1,
    });
    const token = await expiring.signAccessToken(claims);

    // Act
    const verified = await signer.verifyAccessToken(token);

    // Assert
    expect(verified).toBeNull();
  });

  it('rejects garbage', async () => {
    // Act
    const verified = await signer.verifyAccessToken('not-a-jwt');

    // Assert
    expect(verified).toBeNull();
  });
});
