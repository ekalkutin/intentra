import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';

import type { AccountDto } from '@intentra/contracts/iam';

import {
  AccountNotFoundException,
  InvalidCredentialsException,
} from '../../../exceptions/index.js';
import { TokenIssuer } from '../../../ports/index.js';
import { GetOneAccountQuery } from '../../accounts/index.js';

export class VerifyAccessTokenQuery extends Query<AccountDto> {
  constructor(public readonly accessToken: string) {
    super();
  }
}

@QueryHandler(VerifyAccessTokenQuery)
export class VerifyAccessTokenQueryHandler implements IQueryHandler<VerifyAccessTokenQuery> {
  constructor(
    @Inject(TokenIssuer)
    private readonly tokenIssuer: TokenIssuer,

    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  public async execute({
    accessToken,
  }: VerifyAccessTokenQuery): Promise<AccountDto> {
    const accountId = await this.tokenIssuer.verifyAccessToken(accessToken);
    if (!accountId) {
      throw new InvalidCredentialsException();
    }

    try {
      return await this.queryBus.execute(
        new GetOneAccountQuery(accountId.value),
      );
    } catch (error) {
      if (error instanceof AccountNotFoundException) {
        throw new InvalidCredentialsException();
      }
      throw error;
    }
  }
}
