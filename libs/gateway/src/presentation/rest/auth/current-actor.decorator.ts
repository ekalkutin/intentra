import {
  createParamDecorator,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';

import { ACTOR, type ActorRequest } from './actor-request.js';

/** Works only behind `ActorGuard`. */
export const CurrentActor = createParamDecorator(
  (_: unknown, context: ExecutionContext): Actor => {
    const actor = context.switchToHttp().getRequest<ActorRequest>()[ACTOR];
    if (!actor) {
      throw new UnauthorizedException('Access token is missing');
    }

    return actor;
  },
);
