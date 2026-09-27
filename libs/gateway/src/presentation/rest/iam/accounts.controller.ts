import { Controller, Get, Inject } from '@nestjs/common';

import { AccountDto, IamApi } from '@intentra/contracts/iam';

@Controller({
  path: 'iam/accounts',
})
export class AccountsController {
  constructor(
    @Inject(IamApi)
    private readonly iam: IamApi,
  ) {}

  @Get()
  public find(): Promise<AccountDto[]> {
    return this.iam.accounts.find();
  }
}
