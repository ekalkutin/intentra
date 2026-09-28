export type AccessTokenClaims = {
  readonly accountId: string;
  readonly email: string;
};

export type RefreshTokenClaims = {
  readonly accountId: string;
};

export abstract class TokenSigner {
  abstract signAccessToken(claims: AccessTokenClaims): Promise<string>;
  abstract signRefreshToken(claims: RefreshTokenClaims): Promise<string>;
  abstract verifyAccessToken(token: string): Promise<AccessTokenClaims | null>;
  abstract verifyRefreshToken(
    token: string,
  ): Promise<RefreshTokenClaims | null>;
}
