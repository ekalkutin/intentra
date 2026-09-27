import type { AccountDto } from '../account/account.dto.js';

import type { RefreshDto } from './refresh.dto.js';
import type { SignInDto } from './sign-in.dto.js';
import type { SignUpDto } from './sign-up.dto.js';
import type { TokensDto } from './tokens.dto.js';

/** Authentication of IAM. Reached through `IamApi.auth`. */
export interface AuthApi {
  /** Throws `EMAIL_ALREADY_TAKEN` (409). */
  signUp(data: SignUpDto): Promise<TokensDto>;
  /** Throws `INVALID_CREDENTIALS` (401). */
  signIn(data: SignInDto): Promise<TokensDto>;
  /** A new pair for a valid refresh token. Throws `INVALID_CREDENTIALS` (401). */
  refresh(data: RefreshDto): Promise<TokensDto>;
  /** Throws `INVALID_CREDENTIALS` (401). */
  verifyAccessToken(accessToken: string): Promise<AccountDto>;
}
