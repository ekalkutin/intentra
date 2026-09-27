import type {
  AccountDto,
  ChangePasswordDto,
  FindAccountsDto,
  UpdateAccountDto,
} from './account.dto.js';

/** Accounts of IAM. Reached through `IamApi.accounts`. */
export interface AccountsApi {
  /** Throws `ACCOUNT_NOT_FOUND` (404). */
  getById(id: string): Promise<AccountDto>;
  /** Ids with no account are skipped; order is not guaranteed. */
  find(query: FindAccountsDto): Promise<AccountDto[]>;
  /** Throws `ACCOUNT_NOT_FOUND` (404). */
  update(id: string, data: UpdateAccountDto): Promise<AccountDto>;
  /** Throws `WRONG_PASSWORD` (412) when `currentPassword` does not match. */
  changePassword(id: string, data: ChangePasswordDto): Promise<void>;
}
