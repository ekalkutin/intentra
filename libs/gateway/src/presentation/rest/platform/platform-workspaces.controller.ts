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
  DeleteWorkspaceDtoSchema,
  WorkspaceApi,
  type DeleteWorkspaceDto,
  type PlatformWorkspaceDto,
} from '@intentra/contracts/workspace';

import { CurrentActor, PlatformAdminGuard } from '../auth/index.js';

/** Workspaces across the platform, seen from outside. */
@Controller('platform/workspaces')
@UseGuards(PlatformAdminGuard)
export class PlatformWorkspacesController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Get()
  public async list(
    @CurrentActor() actor: Actor,
  ): Promise<PlatformWorkspaceDto[]> {
    return this.workspace.platformWorkspaces.list(actor);
  }

  @Post(':workspaceId/suspend')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async suspend(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
  ): Promise<void> {
    return this.workspace.platformWorkspaces.suspend(actor, workspaceId);
  }

  @Post(':workspaceId/resume')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async resume(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
  ): Promise<void> {
    return this.workspace.platformWorkspaces.resume(actor, workspaceId);
  }

  @Delete(':workspaceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Body({ schema: DeleteWorkspaceDtoSchema }) data: DeleteWorkspaceDto,
  ): Promise<void> {
    return this.workspace.platformWorkspaces.delete(actor, workspaceId, data);
  }
}
