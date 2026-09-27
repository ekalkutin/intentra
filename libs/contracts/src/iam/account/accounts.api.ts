import type { AccountDto } from './account.dto.js';

/** Accounts of IAM. Reached through `IamApi.accounts`. */
export interface AccountsApi {
  /** Throws `ACCOUNT_NOT_FOUND` (404). */
  getById(id: string): Promise<AccountDto>;
}
