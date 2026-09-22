import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { AccessTokenPayload, TokensDto } from '@intentra/iam-contracts';

import { Account } from '../../domain/entities/index.js';
import { IAM_OPTIONS, type IamModuleOptions } from '../../iam.module-defs.js';

/**
 * Пара токенов подписана одним ключом и различается названным внутри типом:
 * `refresh` не может быть предъявлен как `access`, и наоборот.
 */
export type RefreshTokenClaims = { typ: 'refresh'; sub: string };

/**
 * Регистрация, вход и продление отдают одну и ту же пару. Claims говорят только
 * о том, кто этот человек: где ему можно действовать — ответ Workspace на
 * каждый запрос, поэтому устареть здесь нечему.
 */
@Injectable()
export class TokenIssuer {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(IAM_OPTIONS) private readonly options: IamModuleOptions,
  ) {}

  public sign(account: Account): TokensDto {
    const claims: AccessTokenPayload = {
      typ: 'access',
      sub: account.id.toString(),
      email: account.email,
    };

    return {
      access_token: this.jwtService.sign(claims, {
        expiresIn: this.options.security.accessTokenTtl,
      }),
      refresh_token: this.jwtService.sign(
        {
          typ: 'refresh',
          sub: account.id.toString(),
        } satisfies RefreshTokenClaims,
        { expiresIn: this.options.security.refreshTokenTtl },
      ),
    };
  }
}
