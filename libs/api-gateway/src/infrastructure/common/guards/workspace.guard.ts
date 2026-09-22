import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ACCOUNT_SCOPED_KEY } from '../decorators/account-scoped.js';
import { IS_PUBLIC_KEY } from '../decorators/public.js';
import { extractWorkspaceId, getRequest } from '../http/request.helper.js';

/**
 * Второй охранник: называет workspace, который адресует запрос, и больше ничего.
 *
 * Вердикта о правах здесь нет и быть не должно: может ли этот человек что-то
 * в этом workspace — ответ Workspace на собранную здесь `Identity`. Слова
 * «permission» в шлюзе не встречается.
 */
@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public canActivate(context: ExecutionContext): boolean {
    if (this.shouldSkip(context)) {
      return true;
    }

    const request = getRequest(context);

    if (!request.identity) {
      throw new UnauthorizedException();
    }

    const workspaceId = extractWorkspaceId(request);

    if (!workspaceId) {
      throw new BadRequestException('Workspace ID is required');
    }

    request.identity = { ...request.identity, workspaceId };

    return true;
  }

  private shouldSkip(context: ExecutionContext): boolean {
    return [IS_PUBLIC_KEY, ACCOUNT_SCOPED_KEY].some(key =>
      this.reflector.getAllAndOverride<boolean>(key, [
        context.getHandler(),
        context.getClass(),
      ]),
    );
  }
}
