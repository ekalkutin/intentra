import { Injectable, type ExecutionContext } from '@nestjs/common';

import { NotPlatformAdminException } from '../errors/index.js';

import { ACTOR, type ActorRequest } from './actor-request.js';
import { ActorGuard } from './actor.guard.js';

/** For `/api/platform/...`: authenticates the Actor like `ActorGuard`, then lets only a Platform Admin through. */
@Injectable()
export class PlatformAdminGuard extends ActorGuard {
  public override async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    await super.canActivate(context);
    const actor = context.switchToHttp().getRequest<ActorRequest>()[ACTOR];
    if (!actor?.isPlatformAdmin) {
      throw new NotPlatformAdminException();
    }

    return true;
  }
}
