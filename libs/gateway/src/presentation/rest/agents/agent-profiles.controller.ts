import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
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

import {
  CurrentAccount,
  WorkspaceMembership,
  type AuthenticatedAccount,
} from '../../auth/index.js';

@Controller({
  path: '/workspaces/:workspaceId/agents',
})
export class AgentProfilesController {
  constructor(
    @Inject(AgentsApi)
    private readonly agents: AgentsApi,

    @Inject(WorkspaceMembership)
    private readonly membership: WorkspaceMembership,
  ) {}

  @Get()
  public async find(
    @CurrentAccount() account: AuthenticatedAccount,
    @Param('workspaceId') workspaceId: string,
  ): Promise<AgentProfileDto[]> {
    await this.membership.assert(account.id, workspaceId);
    return this.agents.profiles.find(workspaceId);
  }

  @Get(':id')
  public async getById(
    @CurrentAccount() account: AuthenticatedAccount,
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ): Promise<AgentProfileDto> {
    await this.membership.assert(account.id, workspaceId);
    return this.agents.profiles.getById(workspaceId, id);
  }

  @Post()
  public async create(
    @CurrentAccount() account: AuthenticatedAccount,
    @Param('workspaceId') workspaceId: string,
    @Body({ schema: CreateAgentProfileDtoSchema }) data: CreateAgentProfileDto,
  ): Promise<AgentProfileDto> {
    await this.membership.assert(account.id, workspaceId);
    return this.agents.profiles.create(workspaceId, data);
  }

  @Patch(':id')
  public async update(
    @CurrentAccount() account: AuthenticatedAccount,
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Body({ schema: UpdateAgentProfileDtoSchema }) data: UpdateAgentProfileDto,
  ): Promise<AgentProfileDto> {
    await this.membership.assert(account.id, workspaceId);
    return this.agents.profiles.update(workspaceId, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @CurrentAccount() account: AuthenticatedAccount,
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.membership.assert(account.id, workspaceId);
    return this.agents.profiles.delete(workspaceId, id);
  }
}
