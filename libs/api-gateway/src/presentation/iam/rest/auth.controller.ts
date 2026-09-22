import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import {
  RefreshTokenSchema,
  SignInSchema,
  SignUpSchema,
  type AccessTokenPayload,
  type RefreshTokenDto,
  type SignInDto,
  type SignUpDto,
  type TokensDto,
} from '@intentra/iam-contracts';

import { IamClientPort } from '../../../application/ports/index.js';
import {
  AccountScoped,
  AuthenticatedUser,
  Public,
} from '../../../infrastructure/common/decorators/index.js';

@Controller('iam/auth')
@AccountScoped()
export class AuthController {
  constructor(private readonly iam: IamClientPort) {}

  @Public()
  @Post('sign-up')
  public async signUp(
    @Body({ schema: SignUpSchema }) dto: SignUpDto,
  ): Promise<TokensDto> {
    return this.iam.auth.signUp(dto);
  }

  @Public()
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  public async signIn(
    @Body({ schema: SignInSchema }) dto: SignInDto,
  ): Promise<TokensDto> {
    return this.iam.auth.signIn(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refreshToken(
    @Body({ schema: RefreshTokenSchema }) dto: RefreshTokenDto,
  ): Promise<TokensDto> {
    return this.iam.auth.refreshToken(dto);
  }

  /**
   * Кто предъявил токен.
   *
   * Отвечает из уже проверенных claims, не спрашивая IAM второй раз: охранник
   * только что их прочитал, и второй вызов дал бы тот же ответ. Выхода из
   * системы рядом нет намеренно — `RefreshToken` не хранится и не отзывается,
   * поэтому «выйти» это дело браузера, забывшего токены.
   */
  @Get('me')
  public me(@AuthenticatedUser() user: AccessTokenPayload): {
    accountId: string;
    email: string;
  } {
    return { accountId: user.sub, email: user.email };
  }
}
