import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type { PersonalAccessTokenDto } from '@intentra/contracts/iam';
import { AccountId } from '@intentra/shared';

import { PersonalAccessTokenRepository } from '../../../ports/index.js';

export class FindManyPersonalAccessTokensQuery extends Query<
  PersonalAccessTokenDto[]
> {
  constructor(public readonly accountId: string) {
    super();
  }
}

@QueryHandler(FindManyPersonalAccessTokensQuery)
export class FindManyPersonalAccessTokensQueryHandler implements IQueryHandler<FindManyPersonalAccessTokensQuery> {
  constructor(
    @Inject(PersonalAccessTokenRepository)
    private readonly tokenRepository: PersonalAccessTokenRepository,
  ) {}

  public async execute({
    accountId,
  }: FindManyPersonalAccessTokensQuery): Promise<PersonalAccessTokenDto[]> {
    const tokens = await this.tokenRepository.findByAccount(
      new AccountId(accountId),
    );
    return tokens.map(token => ({
      id: token.id.value,
      name: token.name.value,
      createdAt: token.createdAt.toString(),
      expiresAt: token.expiresAt?.toString() ?? null,
      revokedAt: token.revokedAt?.toString() ?? null,
    }));
  }
}
