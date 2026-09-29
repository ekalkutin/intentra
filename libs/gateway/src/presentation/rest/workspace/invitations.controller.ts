import {
  Body,
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
  CreateInvitationDtoSchema,
  WorkspaceApi,
  type CreateInvitationDto,
  type InvitationDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('workspaces/:workspaceId/invitations')
@UseGuards(ActorGuard)
export class InvitationsController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Post()
  public async create(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Body({ schema: CreateInvitationDtoSchema }) data: CreateInvitationDto,
  ): Promise<InvitationDto> {
    return this.workspace.invitations.create(actor, workspaceId, data);
  }

  @Get()
  public async list(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
  ): Promise<InvitationDto[]> {
    return this.workspace.invitations.list(actor, workspaceId);
  }

  @Post(':invitationId/revoke')
  @HttpCode(HttpStatus.OK)
  public async revoke(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('invitationId') invitationId: string,
  ): Promise<InvitationDto> {
    return this.workspace.invitations.revoke(actor, workspaceId, invitationId);
  }
}
