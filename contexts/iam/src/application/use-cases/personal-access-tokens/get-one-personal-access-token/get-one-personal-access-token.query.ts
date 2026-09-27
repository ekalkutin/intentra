import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type { PersonalAccessTokenDto } from '@intentra/contracts/iam';
import { AccountId } from '@intentra/shared';

import { PersonalAccessTokenId } from '../../../../domain/value-objects/index.js';
import { PersonalAccessTokenRepository } from '../../../ports/index.js';

export class GetOnePersonalAccessTokenQuery extends Query<PersonalAccessTokenDto> {
  constructor(
    public readonly accountId: string,
    public readonly id: string,
  ) {
    super();
  }
}

@QueryHandler(GetOnePersonalAccessTokenQuery)
export class GetOnePersonalAccessTokenQueryHandler implements IQueryHandler<GetOnePersonalAccessTokenQuery> {
  constructor(
    @Inject(PersonalAccessTokenRepository)
    private readonly tokenRepository: PersonalAccessTokenRepository,
  ) {}

  public async execute({
    accountId,
    id,
  }: GetOnePersonalAccessTokenQuery): Promise<PersonalAccessTokenDto> {
    const token = await this.tokenRepository.getById(
      new AccountId(accountId),
      new PersonalAccessTokenId(id),
    );
    return {
      id: token.id.value,
      name: token.name.value,
      createdAt: token.createdAt.toString(),
      expiresAt: token.expiresAt?.toString() ?? null,
      revokedAt: token.revokedAt?.toString() ?? null,
    };
  }
}
