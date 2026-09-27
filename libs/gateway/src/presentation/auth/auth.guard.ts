import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IamApi, type AccountDto } from '@intentra/contracts/iam';

import {
  authenticate,
  bearerToken,
  requestOf,
} from './authenticated-request.js';
import { Authentication, AuthMethod } from './authentication.decorator.js';

/**
 * Global: every route needs a token unless it says otherwise. GraphQL field
 * resolvers are not guarded; they run inside an operation that already was.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector)
    private readonly reflector: Reflector,

    @Inject(IamApi)
    private readonly iam: IamApi,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const method =
      this.reflector.getAllAndOverride(Authentication, [
        context.getHandler(),
        context.getClass(),
      ]) ?? AuthMethod.AccessToken;
    if (method === AuthMethod.None) {
      return true;
    }

    const request = requestOf(context);
    const token = bearerToken(request);
    const account = token ? await this.#verify(method, token) : null;
    if (!account) {
      throw new UnauthorizedException();
    }

    authenticate(request, { ...account, method });
    return true;
  }

  #verify(
    method: AuthMethod.AccessToken | AuthMethod.PersonalAccessToken,
    token: string,
  ): Promise<AccountDto | null> {
    return method === AuthMethod.PersonalAccessToken
      ? this.iam.personalAccessTokens.verify(token)
      : this.iam.auth.verifyAccessToken(token);
  }
}
