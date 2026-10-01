import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  SetProviderKeyDtoSchema,
  WorkspaceApi,
  type ProviderKeyDto,
  type SetProviderKeyDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('workspaces/:workspaceId/provider-key')
@UseGuards(ActorGuard)
export class ProviderKeyController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Get()
  public async get(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ProviderKeyDto> {
    return this.workspace.providerKey.get(actor, workspaceId);
  }

  @Put()
  public async set(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Body({ schema: SetProviderKeyDtoSchema }) data: SetProviderKeyDto,
  ): Promise<ProviderKeyDto> {
    return this.workspace.providerKey.set(actor, workspaceId, data);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  public async remove(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
  ): Promise<void> {
    return this.workspace.providerKey.remove(actor, workspaceId);
  }
}
