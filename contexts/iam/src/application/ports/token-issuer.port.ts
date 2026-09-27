import type { TokensDto } from '@intentra/contracts/iam';
import type { AccountId } from '@intentra/shared';

/** Access and refresh tokens of a signed-in account. Nothing is stored. */
export abstract class TokenIssuer {
  abstract issue(accountId: AccountId): Promise<TokensDto>;
  /** `null` for a token that is invalid, expired or of the other kind. */
  abstract verifyAccessToken(token: string): Promise<AccountId | null>;
  /** `null` for a token that is invalid, expired or of the other kind. */
  abstract verifyRefreshToken(token: string): Promise<AccountId | null>;
}
