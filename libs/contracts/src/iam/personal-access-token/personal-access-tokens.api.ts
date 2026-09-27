import type { AccountDto } from '../account/account.dto.js';

import type {
  CreatedPersonalAccessTokenDto,
  CreatePersonalAccessTokenDto,
  PersonalAccessTokenDto,
} from './personal-access-token.dto.js';

/**
 * Personal access tokens of an account, for MCP agents. Reached through
 * `IamApi.personalAccessTokens`.
 */
export interface PersonalAccessTokensApi {
  create(
    accountId: string,
    data: CreatePersonalAccessTokenDto,
  ): Promise<CreatedPersonalAccessTokenDto>;
  /** Revoked and expired ones too, newest first. */
  find(accountId: string): Promise<PersonalAccessTokenDto[]>;
  /**
   * Throws `PERSONAL_ACCESS_TOKEN_NOT_FOUND` (404), also for a token of another
   * account. Revoking a revoked token again does nothing.
   */
  revoke(accountId: string, id: string): Promise<void>;
  /** The account of an active token, `null` otherwise. */
  verify(token: string): Promise<AccountDto | null>;
}
