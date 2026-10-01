import { Inject, Injectable, Provider } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  TokenSigner,
  type AccessTokenClaims,
  type RefreshTokenClaims,
} from '../../../application/ports/outbound/index.js';
import {
  IAM_OPTIONS,
  type IamModuleOptions,
} from '../../../iam.module-defs.js';

type AccessTokenPayload = {
  readonly sub: string;
  readonly email: string;
  readonly name: string;
  readonly platformAdmin: boolean;
};
type RefreshTokenPayload = { readonly sub: string };

/** Access and refresh tokens are signed with different secrets, so one cannot pass for the other. */
@Injectable()
export class TokenSignerAdapter extends TokenSigner {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(IAM_OPTIONS) private readonly options: IamModuleOptions,
  ) {
    super();
  }

  public signAccessToken(claims: AccessTokenClaims): Promise<string> {
    const payload: AccessTokenPayload = {
      sub: claims.accountId,
      email: claims.email,
      name: claims.name,
      platformAdmin: claims.isPlatformAdmin,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.options.accessTokenSecret,
      expiresIn: this.options.accessTokenTtlSeconds,
    });
  }

  public signRefreshToken(claims: RefreshTokenClaims): Promise<string> {
    const payload: RefreshTokenPayload = { sub: claims.accountId };

    return this.jwtService.signAsync(payload, {
      secret: this.options.refreshTokenSecret,
      expiresIn: this.options.refreshTokenTtlSeconds,
    });
  }

  public async verifyAccessToken(
    token: string,
  ): Promise<AccessTokenClaims | null> {
    const payload = await this.verify<AccessTokenPayload>(
      token,
      this.options.accessTokenSecret,
    );
    if (
      typeof payload?.sub !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string' ||
      typeof payload.platformAdmin !== 'boolean'
    ) {
      return null;
    }

    return {
      accountId: payload.sub,
      email: payload.email,
      name: payload.name,
      isPlatformAdmin: payload.platformAdmin,
    };
  }

  public async verifyRefreshToken(
    token: string,
  ): Promise<RefreshTokenClaims | null> {
    const payload = await this.verify<RefreshTokenPayload>(
      token,
      this.options.refreshTokenSecret,
    );
    if (typeof payload?.sub !== 'string') {
      return null;
    }

    return { accountId: payload.sub };
  }

  private async verify<T extends object>(
    token: string,
    secret: string,
  ): Promise<Partial<T> | null> {
    try {
      return await this.jwtService.verifyAsync<T>(token, { secret });
    } catch {
      return null;
    }
  }
}

export const TOKEN_SIGNER_PROVIDER: Provider = {
  provide: TokenSigner,
  useClass: TokenSignerAdapter,
};
