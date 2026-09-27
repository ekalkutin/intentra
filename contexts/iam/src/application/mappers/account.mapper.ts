import type { AccountDto } from '@intentra/contracts/iam';

import type { Account } from '../../domain/entities/index.js';

export function toAccountDto(account: Account): AccountDto {
  return { id: account.id.value, email: account.email.value };
}
