import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import {
  IamApi,
  RefreshDtoSchema,
  SignInDtoSchema,
  SignUpDtoSchema,
  type RefreshDto,
  type SignInDto,
  type SignUpDto,
  type TokensDto,
} from '@intentra/contracts/iam';

import { Public } from '../../auth/index.js';
import { SchemaPipe } from '../schema.pipe.js';

import {
  RefreshInput,
  SignInInput,
  SignUpInput,
  TokensType,
} from './dto/index.js';

@Public()
@Resolver()
export class AuthResolver {
  constructor(
    @Inject(IamApi)
    private readonly iam: IamApi,
  ) {}

  @Mutation(() => TokensType, { name: 'signUp' })
  public signUp(
    @Args('input', { type: () => SignUpInput }, new SchemaPipe(SignUpDtoSchema))
    input: SignUpDto,
  ): Promise<TokensDto> {
    return this.iam.auth.signUp(input);
  }

  @Mutation(() => TokensType, { name: 'signIn' })
  public signIn(
    @Args('input', { type: () => SignInInput }, new SchemaPipe(SignInDtoSchema))
    input: SignInDto,
  ): Promise<TokensDto> {
    return this.iam.auth.signIn(input);
  }

  @Mutation(() => TokensType, { name: 'refresh' })
  public refresh(
    @Args(
      'input',
      { type: () => RefreshInput },
      new SchemaPipe(RefreshDtoSchema),
    )
    input: RefreshDto,
  ): Promise<TokensDto> {
    return this.iam.auth.refresh(input);
  }
}
