import {
  createParamDecorator,
  UnauthorizedException,
  type ExecutionContext,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import type { CallerDto } from '@intentra/contracts/workspace';

import { ACTOR, type ActorRequest } from './actor-request.js';

function readActor(context: ExecutionContext): Actor {
  const actor = context.switchToHttp().getRequest<ActorRequest>()[ACTOR];
  if (!actor) {
    throw new UnauthorizedException('Access token is missing');
  }

  return actor;
}

/** Works only behind `ActorGuard`. */
export const CurrentActor = createParamDecorator(
  (_: unknown, context: ExecutionContext): Actor => readActor(context),
);

/** The Actor as a person working in the web UI, not through an agent; works only behind `ActorGuard`. */
export const CurrentCaller = createParamDecorator(
  (_: unknown, context: ExecutionContext): CallerDto => ({
    actor: readActor(context),
    agent: null,
  }),
);
