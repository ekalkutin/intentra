import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  ListAnalysisRunsDtoSchema,
  StartAnalysisRunDtoSchema,
  WorkspaceApi,
  type AnalysisRunDto,
  type AnalysisRunPageDto,
  type ListAnalysisRunsDto,
  type StartAnalysisRunDto,
} from '@intentra/contracts/workspace';

import { ActorGuard, CurrentActor } from '../auth/index.js';

/** A Project's Analysis Runs: starting one answers at once, the run going on in the background. */
@Controller('workspaces/:workspaceId/projects/:projectId/analysis-runs')
@UseGuards(ActorGuard)
export class AnalysisRunsController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Post()
  public async start(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body({ schema: StartAnalysisRunDtoSchema }) data: StartAnalysisRunDto,
  ): Promise<AnalysisRunDto> {
    return this.workspace.analysisRuns.start(
      actor,
      workspaceId,
      projectId,
      data,
    );
  }

  @Get()
  public async list(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Query({ schema: ListAnalysisRunsDtoSchema }) query: ListAnalysisRunsDto,
  ): Promise<AnalysisRunPageDto> {
    return this.workspace.analysisRuns.list(
      actor,
      workspaceId,
      projectId,
      query,
    );
  }

  @Get(':runId')
  public async get(
    @CurrentActor() actor: Actor,
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('runId') runId: string,
  ): Promise<AnalysisRunDto> {
    return this.workspace.analysisRuns.get(
      actor,
      workspaceId,
      projectId,
      runId,
    );
  }
}
