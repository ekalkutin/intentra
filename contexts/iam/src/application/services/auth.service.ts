import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import type {
  AccountDto,
  AuthApi,
  RefreshDto,
  SignInDto,
  SignUpDto,
  TokensDto,
} from '@intentra/contracts/iam';

import {
  RefreshTokensCommand,
  SignInAccountCommand,
  SignUpAccountCommand,
  VerifyAccessTokenQuery,
} from '../use-cases/auth/index.js';

@Injectable()
export class AuthService implements AuthApi {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,

    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  public signUp(data: SignUpDto): Promise<TokensDto> {
    return this.commandBus.execute(new SignUpAccountCommand(data));
  }

  public signIn(data: SignInDto): Promise<TokensDto> {
    return this.commandBus.execute(new SignInAccountCommand(data));
  }

  public refresh(data: RefreshDto): Promise<TokensDto> {
    return this.commandBus.execute(new RefreshTokensCommand(data));
  }

  public verifyAccessToken(accessToken: string): Promise<AccountDto> {
    return this.queryBus.execute(new VerifyAccessTokenQuery(accessToken));
  }
}
