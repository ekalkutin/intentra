import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { AuthenticatedAccount } from './authenticated-account.js';
import { accountOf, requestOf } from './authenticated-request.js';

/** The account that makes the request. Not for `@Public()` routes. */
export const CurrentAccount = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedAccount => {
    const account = accountOf(requestOf(context));
    if (!account) {
      throw new Error('CurrentAccount is used on a route without a token');
    }
    return account;
  },
);
