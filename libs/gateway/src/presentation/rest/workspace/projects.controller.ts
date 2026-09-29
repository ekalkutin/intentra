import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  CreateProjectDtoSchema,
  WorkspaceApi,
  type CreateProjectDto,
  type ProjectDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('workspaces/:workspaceId/projects')
@UseGuards(ActorGuard)
export class ProjectsController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Post()
  create(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Body({ schema: CreateProjectDtoSchema }) data: CreateProjectDto,
  ): Promise<ProjectDto> {
    return this.workspace.projects.create(actor, workspaceId, data);
  }

  @Get()
  list(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ProjectDto[]> {
    return this.workspace.projects.list(actor, workspaceId);
  }
}
