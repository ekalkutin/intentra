import { Inject } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { IamApi, type AccountDto } from '@intentra/contracts/iam';

import { AccountType } from './dto/index.js';

@Resolver()
export class AccountsResolver {
  constructor(
    @Inject(IamApi)
    private readonly iam: IamApi,
  ) {}

  @Query(() => [AccountType], { name: 'accounts' })
  public accounts(): Promise<AccountDto[]> {
    return this.iam.accounts.find();
  }
}
