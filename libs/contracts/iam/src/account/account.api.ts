import type { AccountDto } from './account.dto.js';

export abstract class AccountApi {
  abstract find(): Promise<AccountDto[]>;
}
