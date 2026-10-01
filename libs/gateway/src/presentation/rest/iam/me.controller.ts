import {
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  UseGuards,
} from '@nestjs/common';

import {
  EditMeDtoSchema,
  IamApi,
  type Actor,
  type EditMeDto,
  type MeDto,
} from '@intentra/contracts/iam';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('iam/me')
@UseGuards(ActorGuard)
export class MeController {
  constructor(@Inject(IamApi) private readonly iam: IamApi) {}

  @Get()
  public async me(@CurrentActor() actor: Actor): Promise<MeDto> {
    return this.iam.accounts.getMe(actor);
  }

  @Patch()
  public async edit(
    @CurrentActor() actor: Actor,
    @Body({ schema: EditMeDtoSchema }) data: EditMeDto,
  ): Promise<MeDto> {
    return this.iam.accounts.editMe(actor, data);
  }
}
