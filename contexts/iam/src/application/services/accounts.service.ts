import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import type { AccountDto, AccountsApi } from '@intentra/contracts/iam';

import { GetOneAccountQuery } from '../use-cases/accounts/index.js';

@Injectable()
export class AccountsService implements AccountsApi {
  constructor(
    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  public getById(id: string): Promise<AccountDto> {
    return this.queryBus.execute(new GetOneAccountQuery(id));
  }
}
