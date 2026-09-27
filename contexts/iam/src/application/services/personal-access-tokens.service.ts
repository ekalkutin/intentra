import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import type {
  AccountDto,
  CreatedPersonalAccessTokenDto,
  CreatePersonalAccessTokenDto,
  PersonalAccessTokenDto,
  PersonalAccessTokensApi,
} from '@intentra/contracts/iam';

import {
  CreatePersonalAccessTokenCommand,
  FindManyPersonalAccessTokensQuery,
  GetOnePersonalAccessTokenQuery,
  RevokePersonalAccessTokenCommand,
  VerifyPersonalAccessTokenQuery,
} from '../use-cases/personal-access-tokens/index.js';

@Injectable()
export class PersonalAccessTokensService implements PersonalAccessTokensApi {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,

    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  public async create(
    accountId: string,
    data: CreatePersonalAccessTokenDto,
  ): Promise<CreatedPersonalAccessTokenDto> {
    const { id, secret } = await this.commandBus.execute(
      new CreatePersonalAccessTokenCommand(accountId, data),
    );
    const personalAccessToken = await this.queryBus.execute(
      new GetOnePersonalAccessTokenQuery(accountId, id),
    );
    return { token: secret, personalAccessToken };
  }

  public find(accountId: string): Promise<PersonalAccessTokenDto[]> {
    return this.queryBus.execute(
      new FindManyPersonalAccessTokensQuery(accountId),
    );
  }

  public revoke(accountId: string, id: string): Promise<void> {
    return this.commandBus.execute(
      new RevokePersonalAccessTokenCommand(accountId, id),
    );
  }

  public verify(token: string): Promise<AccountDto> {
    return this.queryBus.execute(new VerifyPersonalAccessTokenQuery(token));
  }
}
