import { Controller, Get } from '@nestjs/common';

import type { AccountDto } from '@intentra/contracts/iam';

import { CurrentAccount, type AuthenticatedAccount } from '../../auth/index.js';

@Controller({
  path: 'iam/accounts',
})
export class AccountsController {
  /** Already read by the guard: no second trip to IAM. */
  @Get('/me')
  public me(@CurrentAccount() account: AuthenticatedAccount): AccountDto {
    return { id: account.id, email: account.email };
  }
}
