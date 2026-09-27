import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import type {
  AccountDto,
  AccountsApi,
  ChangePasswordDto,
  FindAccountsDto,
  UpdateAccountDto,
} from '@intentra/contracts/iam';

import {
  ChangeAccountPasswordCommand,
  FindManyAccountsQuery,
  GetOneAccountQuery,
  UpdateAccountCommand,
} from '../use-cases/accounts/index.js';

@Injectable()
export class AccountsService implements AccountsApi {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,

    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  public getById(id: string): Promise<AccountDto> {
    return this.queryBus.execute(new GetOneAccountQuery(id));
  }

  public find(filter: FindAccountsDto): Promise<AccountDto[]> {
    return this.queryBus.execute(new FindManyAccountsQuery(filter));
  }

  public async update(id: string, data: UpdateAccountDto): Promise<AccountDto> {
    await this.commandBus.execute(new UpdateAccountCommand(id, data));
    return this.getById(id);
  }

  public changePassword(id: string, data: ChangePasswordDto): Promise<void> {
    return this.commandBus.execute(new ChangeAccountPasswordCommand(id, data));
  }
}
