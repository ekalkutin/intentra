import { Controller, Get, Inject } from '@nestjs/common';

import { AccountDto, IamApi } from '@intentra/iam-contracts';

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
