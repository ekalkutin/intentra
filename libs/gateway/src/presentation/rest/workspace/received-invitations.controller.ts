import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  WorkspaceApi,
  type InvitationDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('invitations')
@UseGuards(ActorGuard)
export class ReceivedInvitationsController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Get()
  public async list(@CurrentActor() actor: Actor): Promise<InvitationDto[]> {
    return this.workspace.invitations.listReceived(actor);
  }

  @Get(':invitationId')
  public async get(
    @CurrentActor() actor: Actor,
    @Param('invitationId') invitationId: string,
  ): Promise<InvitationDto> {
    return this.workspace.invitations.getReceived(actor, invitationId);
  }

  @Post(':invitationId/accept')
  @HttpCode(HttpStatus.OK)
  public async accept(
    @CurrentActor() actor: Actor,
    @Param('invitationId') invitationId: string,
  ): Promise<InvitationDto> {
    return this.workspace.invitations.accept(actor, invitationId);
  }

  @Post(':invitationId/decline')
  @HttpCode(HttpStatus.OK)
  public async decline(
    @CurrentActor() actor: Actor,
    @Param('invitationId') invitationId: string,
  ): Promise<InvitationDto> {
    return this.workspace.invitations.decline(actor, invitationId);
  }
}
