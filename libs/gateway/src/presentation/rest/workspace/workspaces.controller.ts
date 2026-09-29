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
  CreateWorkspaceDtoSchema,
  DeleteWorkspaceDtoSchema,
  WorkspaceApi,
  type CreateWorkspaceDto,
  type DeleteWorkspaceDto,
  type WorkspaceDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('workspaces')
@UseGuards(ActorGuard)
export class WorkspacesController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Post()
  public async create(
    @CurrentActor() actor: Actor,
    @Body({ schema: CreateWorkspaceDtoSchema }) data: CreateWorkspaceDto,
  ): Promise<WorkspaceDto> {
    return this.workspace.workspaces.create(actor, data);
  }

  @Get()
  public async list(@CurrentActor() actor: Actor): Promise<WorkspaceDto[]> {
    return this.workspace.workspaces.list(actor);
  }

  @Delete(':workspaceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Body({ schema: DeleteWorkspaceDtoSchema }) data: DeleteWorkspaceDto,
  ): Promise<void> {
    return this.workspace.workspaces.delete(actor, workspaceId, data);
  }
}
