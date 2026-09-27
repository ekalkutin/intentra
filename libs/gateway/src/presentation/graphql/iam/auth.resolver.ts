import { Inject } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import {
  IamApi,
  SignUpDtoSchema,
  type SignUpDto,
  type TokensDto,
} from '@intentra/contracts/iam';

import { SchemaPipe } from '../schema.pipe.js';

import { SignUpInput, TokensType } from './dto/index.js';

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
}
