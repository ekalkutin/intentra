import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import type { TokensDto } from '@intentra/contracts/iam';
import { AccountId } from '@intentra/shared';

import { TokenIssuer } from '../../application/ports/index.js';
import {
  IAM_OPTIONS,
  type IamModuleOptions,
} from '../../iam.module-definition.js';

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;
const ALGORITHM = 'HS256';

type TokenPayload = { sub: string };

/** JWT, HS256. The kinds differ by secret, so no kind claim is needed. */
@Injectable()
export class TokenIssuerAdapter extends TokenIssuer {
  constructor(
    @Inject(JwtService)
    private readonly jwt: JwtService,

    @Inject(IAM_OPTIONS)
    private readonly options: IamModuleOptions,
  ) {
    super();
  }

  public async issue(accountId: AccountId): Promise<TokensDto> {
    const payload: TokenPayload = { sub: accountId.value };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.options.accessTokenSecret,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
        algorithm: ALGORITHM,
      }),
      this.jwt.signAsync(payload, {
        secret: this.options.refreshTokenSecret,
        expiresIn: REFRESH_TOKEN_TTL_SECONDS,
        algorithm: ALGORITHM,
      }),
    ]);
    return { accessToken, refreshToken };
  }

  public verifyAccessToken(token: string): Promise<AccountId | null> {
    return this.#verify(token, this.options.accessTokenSecret);
  }

  public verifyRefreshToken(token: string): Promise<AccountId | null> {
    return this.#verify(token, this.options.refreshTokenSecret);
  }

  async #verify(token: string, secret: string): Promise<AccountId | null> {
    try {
      const { sub } = await this.jwt.verifyAsync<TokenPayload>(token, {
        secret,
        algorithms: [ALGORITHM],
      });
      return sub ? new AccountId(sub) : null;
    } catch {
      return null;
    }
  }
}
