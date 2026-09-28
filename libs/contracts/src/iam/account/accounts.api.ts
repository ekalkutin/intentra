import type { CreateAccountDto } from './create-account.dto.js';

/** Account operations, reached through `IamApi.accounts`. */
export interface AccountsApi {
  create(data: CreateAccountDto): Promise<void>;
}
