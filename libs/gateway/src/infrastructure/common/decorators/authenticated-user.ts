import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AccessTokenPayload } from '@intentra/iam-contracts';

import { getRequest } from '../http/request.helper.js';

/**
 * Claims проверенного токена.
 *
 * Заполняет `AuthenticatedGuard`, а он отказывает, когда токена нет или он
 * негоден, — значит до обработчика доходит только запрос с claims. На маршруте
 * с `@Public()` использовать нельзя: там никто ничего не проверял.
 */
export const AuthenticatedUser = createParamDecorator(
  (_: unknown, context: ExecutionContext): AccessTokenPayload =>
    getRequest(context).user as AccessTokenPayload,
);
