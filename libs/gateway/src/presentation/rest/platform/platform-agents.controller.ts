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
  Put,
  UseGuards,
} from '@nestjs/common';

import type { Actor } from '@intentra/contracts/iam';
import {
  CreateAgentDtoSchema,
  PublishAgentsDtoSchema,
  SaveAgentDtoSchema,
  SaveModelProfileDtoSchema,
  SaveSkillDtoSchema,
  WorkspaceApi,
  type AgentsChangesDto,
  type AgentsVersionDto,
  type AgentsVersionSummaryDto,
  type AgentToolDto,
  type CreateAgentDto,
  type ModelProfileDto,
  type PlatformAgentDto,
  type PublishAgentsDto,
  type SaveAgentDto,
  type SaveModelProfileDto,
  type SaveSkillDto,
  type SkillDto,
  type UnpublishedAgentsDto,
} from '@intentra/contracts/workspace';

import { CurrentActor, PlatformAdminGuard } from '../auth/index.js';

/** Intentra's Agents as a Platform Admin designs and publishes them. */
@Controller('platform/agents')
@UseGuards(PlatformAdminGuard)
export class PlatformAgentsController {
  constructor(@Inject(WorkspaceApi) private readonly workspace: WorkspaceApi) {}

  @Get('unpublished')
  public async getUnpublished(
    @CurrentActor() actor: Actor,
  ): Promise<UnpublishedAgentsDto> {
    return this.workspace.platformAgents.getUnpublished(actor);
  }

  @Get('unpublished/changes')
  public async getChanges(
    @CurrentActor() actor: Actor,
  ): Promise<AgentsChangesDto> {
    return this.workspace.platformAgents.getChanges(actor);
  }

  @Post('unpublished/agents')
  public async createAgent(
    @CurrentActor() actor: Actor,
    @Body({ schema: CreateAgentDtoSchema }) data: CreateAgentDto,
  ): Promise<PlatformAgentDto> {
    return this.workspace.platformAgents.createAgent(actor, data);
  }

  @Put('unpublished/agents/:agentId')
  public async editAgent(
    @CurrentActor() actor: Actor,
    @Param('agentId') agentId: string,
    @Body({ schema: SaveAgentDtoSchema }) data: SaveAgentDto,
  ): Promise<PlatformAgentDto> {
    return this.workspace.platformAgents.editAgent(actor, agentId, data);
  }

  @Delete('unpublished/agents/:agentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteAgent(
    @CurrentActor() actor: Actor,
    @Param('agentId') agentId: string,
  ): Promise<void> {
    return this.workspace.platformAgents.deleteAgent(actor, agentId);
  }

  @Post('unpublished/skills')
  public async createSkill(
    @CurrentActor() actor: Actor,
    @Body({ schema: SaveSkillDtoSchema }) data: SaveSkillDto,
  ): Promise<SkillDto> {
    return this.workspace.platformAgents.createSkill(actor, data);
  }

  @Put('unpublished/skills/:skillId')
  public async editSkill(
    @CurrentActor() actor: Actor,
    @Param('skillId') skillId: string,
    @Body({ schema: SaveSkillDtoSchema }) data: SaveSkillDto,
  ): Promise<SkillDto> {
    return this.workspace.platformAgents.editSkill(actor, skillId, data);
  }

  @Delete('unpublished/skills/:skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteSkill(
    @CurrentActor() actor: Actor,
    @Param('skillId') skillId: string,
  ): Promise<void> {
    return this.workspace.platformAgents.deleteSkill(actor, skillId);
  }

  @Post('unpublished/model-profiles')
  public async createModelProfile(
    @CurrentActor() actor: Actor,
    @Body({ schema: SaveModelProfileDtoSchema }) data: SaveModelProfileDto,
  ): Promise<ModelProfileDto> {
    return this.workspace.platformAgents.createModelProfile(actor, data);
  }

  @Put('unpublished/model-profiles/:modelProfileId')
  public async editModelProfile(
    @CurrentActor() actor: Actor,
    @Param('modelProfileId') modelProfileId: string,
    @Body({ schema: SaveModelProfileDtoSchema }) data: SaveModelProfileDto,
  ): Promise<ModelProfileDto> {
    return this.workspace.platformAgents.editModelProfile(
      actor,
      modelProfileId,
      data,
    );
  }

  @Delete('unpublished/model-profiles/:modelProfileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async deleteModelProfile(
    @CurrentActor() actor: Actor,
    @Param('modelProfileId') modelProfileId: string,
  ): Promise<void> {
    return this.workspace.platformAgents.deleteModelProfile(
      actor,
      modelProfileId,
    );
  }

  @Get('tools')
  public async listTools(
    @CurrentActor() actor: Actor,
  ): Promise<AgentToolDto[]> {
    return this.workspace.platformAgents.listTools(actor);
  }

  @Post('versions')
  public async publish(
    @CurrentActor() actor: Actor,
    @Body({ schema: PublishAgentsDtoSchema }) data: PublishAgentsDto,
  ): Promise<AgentsVersionSummaryDto> {
    return this.workspace.platformAgents.publish(actor, data);
  }

  @Get('versions')
  public async listVersions(
    @CurrentActor() actor: Actor,
  ): Promise<AgentsVersionSummaryDto[]> {
    return this.workspace.platformAgents.listVersions(actor);
  }

  @Get('versions/:number')
  public async getVersion(
    @CurrentActor() actor: Actor,
    @Param('number') number: string,
  ): Promise<AgentsVersionDto> {
    return this.workspace.platformAgents.getVersion(actor, Number(number));
  }

  @Post('versions/:number/republish')
  public async republish(
    @CurrentActor() actor: Actor,
    @Param('number') number: string,
    @Body({ schema: PublishAgentsDtoSchema }) data: PublishAgentsDto,
  ): Promise<AgentsVersionSummaryDto> {
    return this.workspace.platformAgents.republish(actor, Number(number), data);
  }
}
