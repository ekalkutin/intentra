import { Inject } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import {
  CreatePersonalAccessTokenDtoSchema,
  IamApi,
  type CreatedPersonalAccessTokenDto,
  type CreatePersonalAccessTokenDto,
  type PersonalAccessTokenDto,
} from '@intentra/contracts/iam';

import { CurrentAccount, type AuthenticatedAccount } from '../../auth/index.js';
import { SchemaPipe } from '../schema.pipe.js';

import {
  CreatedPersonalAccessTokenType,
  CreatePersonalAccessTokenInput,
  PersonalAccessTokenType,
} from './dto/index.js';

/** Managed by a signed-in person only: a token cannot make more tokens. */
@Resolver()
export class PersonalAccessTokensResolver {
  constructor(
    @Inject(IamApi)
    private readonly iam: IamApi,
  ) {}

  @Query(() => [PersonalAccessTokenType], { name: 'personalAccessTokens' })
  public personalAccessTokens(
    @CurrentAccount() account: AuthenticatedAccount,
  ): Promise<PersonalAccessTokenDto[]> {
    return this.iam.personalAccessTokens.find(account.id);
  }

  @Mutation(() => CreatedPersonalAccessTokenType, {
    name: 'createPersonalAccessToken',
  })
  public createPersonalAccessToken(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args(
      'input',
      { type: () => CreatePersonalAccessTokenInput },
      new SchemaPipe(CreatePersonalAccessTokenDtoSchema),
    )
    input: CreatePersonalAccessTokenDto,
  ): Promise<CreatedPersonalAccessTokenDto> {
    return this.iam.personalAccessTokens.create(account.id, input);
  }

  /** Revoking a revoked token again still returns `true`. */
  @Mutation(() => Boolean, { name: 'revokePersonalAccessToken' })
  public async revokePersonalAccessToken(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.iam.personalAccessTokens.revoke(account.id, id);
    return true;
  }
}
