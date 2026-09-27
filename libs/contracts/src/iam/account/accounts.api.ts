import type { AccountDto } from './account.dto.js';

/** Accounts of IAM. Reached through `IamApi.accounts`. */
export interface AccountsApi {
  find(): Promise<AccountDto[]>;
}
