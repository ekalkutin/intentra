import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  CreateWorkspaceDtoSchema,
  WorkspaceApi,
  type CreateWorkspaceDto,
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
}
