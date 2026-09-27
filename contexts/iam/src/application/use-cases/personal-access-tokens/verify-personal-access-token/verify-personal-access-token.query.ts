import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';

import type { AccountDto } from '@intentra/contracts/iam';
import { Timestamp } from '@intentra/shared';

import {
  AccountNotFoundException,
  InvalidCredentialsException,
} from '../../../exceptions/index.js';
import {
  PersonalAccessTokenRepository,
  PersonalAccessTokenSecrets,
} from '../../../ports/index.js';
import { GetOneAccountQuery } from '../../accounts/index.js';

export class VerifyPersonalAccessTokenQuery extends Query<AccountDto> {
  constructor(public readonly token: string) {
    super();
  }
}

@QueryHandler(VerifyPersonalAccessTokenQuery)
export class VerifyPersonalAccessTokenQueryHandler implements IQueryHandler<VerifyPersonalAccessTokenQuery> {
  constructor(
    @Inject(PersonalAccessTokenRepository)
    private readonly tokenRepository: PersonalAccessTokenRepository,

    @Inject(PersonalAccessTokenSecrets)
    private readonly secrets: PersonalAccessTokenSecrets,

    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  public async execute({
    token,
  }: VerifyPersonalAccessTokenQuery): Promise<AccountDto> {
    const found = await this.tokenRepository.findBySecretHash(
      this.secrets.hash(token),
    );
    if (!found?.isActive(Timestamp.now())) {
      throw new InvalidCredentialsException();
    }

    try {
      return await this.queryBus.execute(
        new GetOneAccountQuery(found.accountId.value),
      );
    } catch (error) {
      if (error instanceof AccountNotFoundException) {
        throw new InvalidCredentialsException();
      }
      throw error;
    }
  }
}
