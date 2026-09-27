import type { PersonalAccessTokensQuery } from '../api/__generated__/personal-access-tokens.query.generated';

export type PersonalAccessToken =
  PersonalAccessTokensQuery['personalAccessTokens'][number];

export const TOKEN_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  REVOKED: 'revoked',
} as const;

export type TokenStatus = (typeof TOKEN_STATUS)[keyof typeof TOKEN_STATUS];

export const tokenStatus = (
  token: PersonalAccessToken,
  now: Date = new Date(),
): TokenStatus => {
  if (token.revokedAt) return TOKEN_STATUS.REVOKED;
  if (token.expiresAt && new Date(token.expiresAt) <= now) {
    return TOKEN_STATUS.EXPIRED;
  }
  return TOKEN_STATUS.ACTIVE;
};
