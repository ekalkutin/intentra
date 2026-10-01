import { Body, Controller, Get, Inject, Put, UseGuards } from '@nestjs/common';

import {
  IamApi,
  OpenSignUpDtoSchema,
  type Actor,
  type OpenSignUpDto,
} from '@intentra/contracts/iam';

import { CurrentActor, PlatformAdminGuard } from '../auth/index.js';

/** Open Sign-up: whether anyone may create an Account, or only the invited. */
@Controller('platform/sign-up')
@UseGuards(PlatformAdminGuard)
export class PlatformSignUpController {
  constructor(@Inject(IamApi) private readonly iam: IamApi) {}

  @Get()
  public async get(@CurrentActor() actor: Actor): Promise<OpenSignUpDto> {
    return this.iam.signUp.get(actor);
  }

  @Put()
  public async set(
    @CurrentActor() actor: Actor,
    @Body({ schema: OpenSignUpDtoSchema }) data: OpenSignUpDto,
  ): Promise<OpenSignUpDto> {
    return this.iam.signUp.set(actor, data);
  }
}
