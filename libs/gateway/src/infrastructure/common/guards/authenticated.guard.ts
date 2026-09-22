import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IamClientPort } from '../../../application/ports/index.js';
import { IS_PUBLIC_KEY } from '../decorators/public.js';
import { extractBearerToken, getRequest } from '../http/request.helper.js';

/**
 * Первый из двух охранников: отвечает на вопрос «кто это».
 *
 * Ключ подписи шлюз не держит — он спрашивает IAM через порт. Так секрет
 * остаётся у того, кто им подписывает, а фасад остаётся фасадом.
 */
@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly iam: IamClientPort,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = getRequest(context);
    const token = extractBearerToken(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const claims = await this.iam.auth.verifyAccessToken({ token });

    if (!claims) {
      throw new UnauthorizedException();
    }

    request.user = claims;
    request.identity = {
      accountId: claims.sub,
      /* Платформенных ролей в MVP нет: IAM их не хранит, и спросить не у кого.
         Когда появятся — здесь будет один вызов порта, и только здесь: это
         единственное, что шлюз знает о правах (ADR 0003). */
      isPlatformAdmin: false,
    };

    return true;
  }
}
