import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
  AccessTokenPayload,
  AuthApi,
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  TokensDto,
  VerifyAccessTokenDto,
} from '@intentra/iam-contracts';

import {
  RefreshTokenCommand,
  SignInCommand,
  SignUpCommand,
  VerifyAccessTokenQuery,
} from '../use-cases/auth/index.js';

/** Тонкий переходник от опубликованного API к шине: правил здесь нет. */
@Injectable()
export class AuthService implements AuthApi {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  public async signUp(dto: SignUpDto): Promise<TokensDto> {
    return this.commandBus.execute(new SignUpCommand(dto));
  }

  public async signIn(dto: SignInDto): Promise<TokensDto> {
    return this.commandBus.execute(new SignInCommand(dto));
  }

  public async refreshToken(dto: RefreshTokenDto): Promise<TokensDto> {
    return this.commandBus.execute(new RefreshTokenCommand(dto));
  }

  public async verifyAccessToken(
    dto: VerifyAccessTokenDto,
  ): Promise<AccessTokenPayload | null> {
    return this.queryBus.execute(new VerifyAccessTokenQuery(dto));
  }
}
