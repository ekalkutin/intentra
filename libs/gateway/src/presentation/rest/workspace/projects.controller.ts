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
  CreateProjectDtoSchema,
  DeleteProjectDtoSchema,
  WorkspaceApi,
  type CreateProjectDto,
  type DeleteProjectDto,
  type ProjectDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

@Controller('workspaces/:workspaceId/projects')
@UseGuards(ActorGuard)
export class ProjectsController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Post()
  public async create(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Body({ schema: CreateProjectDtoSchema }) data: CreateProjectDto,
  ): Promise<ProjectDto> {
    return this.workspace.projects.create(actor, workspaceId, data);
  }

  @Get()
  public async list(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
  ): Promise<ProjectDto[]> {
    return this.workspace.projects.list(actor, workspaceId);
  }

  @Delete(':projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body({ schema: DeleteProjectDtoSchema }) data: DeleteProjectDto,
  ): Promise<void> {
    return this.workspace.projects.delete(actor, workspaceId, projectId, data);
  }
}
