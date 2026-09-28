import { Controller, Get, UseGuards } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('iam/me')
@UseGuards(ActorGuard)
export class MeController {
  @Get()
  public me(@CurrentActor() actor: Actor): Actor {
    return actor;
  }
}
