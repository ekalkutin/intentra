import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AccountIdentity, Identity } from '@intentra/workspace-contracts';

import { getRequest } from '../http/request.helper.js';

/**
 * Кто спрашивает и в каком workspace.
 *
 * Бросает обычную ошибку, а не HTTP-отказ: отсутствие workspace здесь — не
 * беда вызывающего, а неверно собранный маршрут, и узнать об этом должен
 * разработчик, а не пользователь.
 */
export const RequestIdentity = createParamDecorator(
  (_: unknown, context: ExecutionContext): Identity => {
    const { identity } = getRequest(context);

    if (!identity?.workspaceId) {
      throw new Error(
        'No workspace identity on the request: this handler must run behind WorkspaceGuard',
      );
    }

    return identity as Identity;
  },
);

/** Только человек, до всякого workspace. Кладёт `AuthenticatedGuard`. */
export const RequestAccount = createParamDecorator(
  (_: unknown, context: ExecutionContext): AccountIdentity => {
    const { identity } = getRequest(context);

    if (!identity) {
      throw new Error(
        'No account on the request: this handler must be authenticated',
      );
    }

    return {
      accountId: identity.accountId,
      isPlatformAdmin: identity.isPlatformAdmin,
    };
  },
);
