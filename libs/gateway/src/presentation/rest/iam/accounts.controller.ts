import { Controller, Get, Inject } from '@nestjs/common';

import { AccountApi, AccountDto } from '@intentra/iam-contracts';

@Controller({
  path: 'iam/accounts',
})
export class AccountsController {
  constructor(
    @Inject(AccountApi)
    private readonly accountApi: AccountApi,
  ) {}

  @Get()
  public find(): Promise<AccountDto[]> {
    return this.accountApi.find();
  }
}
