import { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { AccessTokenPayload } from '@intentra/iam-contracts';
import { AccountIdentity } from '@intentra/workspace-contracts';

/** `workspaceId` появляется позже `accountId`: его называет адрес запроса, а не токен. */
export type RequestIdentity = AccountIdentity & { workspaceId?: string };

export type AuthenticatedRequest = Request & {
  user?: AccessTokenPayload;
  identity?: RequestIdentity;
};

export function getRequest(context: ExecutionContext): AuthenticatedRequest {
  return context.switchToHttp().getRequest<AuthenticatedRequest>();
}

/** Схема читается без учёта регистра: так её пишут и браузеры, и curl. */
export function extractBearerToken(
  request: AuthenticatedRequest,
): string | null {
  const header = request.headers.authorization;

  if (!header) {
    return null;
  }

  const [scheme, token] = header.split(' ');

  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

/**
 * Какой workspace адресует запрос.
 *
 * Смотрим в параметры маршрута: `workspaceId` приходит путём, а не телом.
 * Читать его из тела значило бы позволить вызывающему назвать один workspace в
 * адресе и другой в полезной нагрузке.
 */
export function extractWorkspaceId(
  request: AuthenticatedRequest,
): string | undefined {
  const params = request.params as Record<string, string | undefined>;

  return params['workspaceId'];
}
