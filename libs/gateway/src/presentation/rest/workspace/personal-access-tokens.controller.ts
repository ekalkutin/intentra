import {
  Body,
  Controller,
  Delete,
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
  CreatePersonalAccessTokenDtoSchema,
  WorkspaceApi,
  type CreatedPersonalAccessTokenDto,
  type CreatePersonalAccessTokenDto,
  type PersonalAccessTokenDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('workspaces/:workspaceId/personal-access-tokens')
@UseGuards(ActorGuard)
export class PersonalAccessTokensController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Post()
  public async create(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Body({ schema: CreatePersonalAccessTokenDtoSchema })
    data: CreatePersonalAccessTokenDto,
  ): Promise<CreatedPersonalAccessTokenDto> {
    return this.workspace.personalAccessTokens.create(actor, workspaceId, data);
  }

  @Get()
  public async list(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
  ): Promise<PersonalAccessTokenDto[]> {
    return this.workspace.personalAccessTokens.list(actor, workspaceId);
  }

  @Delete(':tokenId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async revoke(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('tokenId') tokenId: string,
  ): Promise<void> {
    return this.workspace.personalAccessTokens.revoke(
      actor,
      workspaceId,
      tokenId,
    );
  }
}
