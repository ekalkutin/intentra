import type { IncomingMessage } from 'node:http';

import type { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext, type GqlContextType } from '@nestjs/graphql';

import type { AuthenticatedAccount } from './authenticated-account.js';

const ACCOUNT = Symbol('account');

/** Set by `AuthGuard` once the token is verified. */
export type AuthenticatedRequest = IncomingMessage & {
  [ACCOUNT]?: AuthenticatedAccount;
};

const BEARER = /^Bearer\s+(\S+)$/i;

export function bearerToken(request: IncomingMessage): string | null {
  return request.headers.authorization?.match(BEARER)?.[1] ?? null;
}

/** The HTTP request behind a REST call or a GraphQL operation. */
export function requestOf(context: ExecutionContext): AuthenticatedRequest {
  if (context.getType<GqlContextType>() === 'graphql') {
    return GqlExecutionContext.create(context).getContext<{
      req: AuthenticatedRequest;
    }>().req;
  }
  return context.switchToHttp().getRequest<AuthenticatedRequest>();
}

export function authenticate(
  request: AuthenticatedRequest,
  account: AuthenticatedAccount,
): void {
  request[ACCOUNT] = account;
}

export function accountOf(
  request: AuthenticatedRequest,
): AuthenticatedAccount | null {
  return request[ACCOUNT] ?? null;
}
