import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  ChangeAnalysisScheduleDtoSchema,
  WorkspaceApi,
  type AnalysisScheduleDto,
  type ChangeAnalysisScheduleDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

/** A Project's nightly Analysis Run: read by every Member, turned on or off by a Maintainer. */
@Controller('workspaces/:workspaceId/projects/:projectId/analysis-schedule')
@UseGuards(ActorGuard)
export class AnalysisScheduleController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Get()
  public async get(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
  ): Promise<AnalysisScheduleDto> {
    return this.workspace.analysisRuns.schedule(actor, workspaceId, projectId);
  }

  @Put()
  public async change(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body({ schema: ChangeAnalysisScheduleDtoSchema })
    data: ChangeAnalysisScheduleDto,
  ): Promise<AnalysisScheduleDto> {
    return this.workspace.analysisRuns.changeSchedule(
      actor,
      workspaceId,
      projectId,
      data,
    );
  }
}
