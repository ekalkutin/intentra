import { Body, Controller, Get, Inject, Put, UseGuards } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  OpenWorkspaceCreationDtoSchema,
  WorkspaceApi,
  type OpenWorkspaceCreationDto,
} from '@intentra/contracts/workspace';

import { CurrentActor, PlatformAdminGuard } from '../auth/index.js';

/** Open Workspace Creation: whether anyone may create a Workspace, or only a Platform Admin. */
@Controller('platform/workspace-creation')
@UseGuards(PlatformAdminGuard)
export class PlatformWorkspaceCreationController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Get()
  public async get(
    @CurrentActor() actor: Actor,
  ): Promise<OpenWorkspaceCreationDto> {
    return this.workspace.platformWorkspaces.getCreation(actor);
  }

  @Put()
  public async set(
    @CurrentActor() actor: Actor,
    @Body({ schema: OpenWorkspaceCreationDtoSchema })
    data: OpenWorkspaceCreationDto,
  ): Promise<OpenWorkspaceCreationDto> {
    return this.workspace.platformWorkspaces.setCreation(actor, data);
  }
}
