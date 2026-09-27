import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  AgentsApi,
  CreateAgentProfileDtoSchema,
  UpdateAgentProfileDtoSchema,
  type AgentProfileDto,
  type CreateAgentProfileDto,
  type UpdateAgentProfileDto,
} from '@intentra/contracts/agents';

@Controller({
  path: '/workspaces/:workspaceId/agents',
})
export class AgentProfilesController {
  constructor(
    @Inject(AgentsApi)
    private readonly agents: AgentsApi,
  ) {}

  @Get()
  public find(
    @Param('workspaceId') workspaceId: string,
  ): Promise<AgentProfileDto[]> {
    return this.agents.profiles.find(workspaceId);
  }

  @Get(':id')
  public async findById(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ): Promise<AgentProfileDto> {
    const profile = await this.agents.profiles.findById(workspaceId, id);
    if (!profile) {
      throw new NotFoundException();
    }
    return profile;
  }

  @Post()
  public create(
    @Param('workspaceId') workspaceId: string,
    @Body({ schema: CreateAgentProfileDtoSchema }) data: CreateAgentProfileDto,
  ): Promise<AgentProfileDto> {
    return this.agents.profiles.create(workspaceId, data);
  }

  @Patch(':id')
  public async update(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body({ schema: UpdateAgentProfileDtoSchema }) data: UpdateAgentProfileDto,
  ): Promise<AgentProfileDto> {
    const profile = await this.agents.profiles.update(workspaceId, id, data);
    if (!profile) {
      throw new NotFoundException();
    }
    return profile;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public delete(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.agents.profiles.delete(workspaceId, id);
  }
}
