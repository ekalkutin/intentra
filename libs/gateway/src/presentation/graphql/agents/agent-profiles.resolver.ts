import { Inject } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

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
import { SchemaPipe } from '../schema.pipe.js';

import {
  AgentProfileType,
  CreateAgentProfileInput,
  UpdateAgentProfileInput,
} from './dto/index.js';

@Resolver()
export class AgentProfilesResolver {
  constructor(
    @Inject(AgentsApi)
    private readonly agents: AgentsApi,

    @Inject(WorkspaceMembership)
    private readonly membership: WorkspaceMembership,
  ) {}

  @Query(() => [AgentProfileType], { name: 'agentProfiles' })
  public async agentProfiles(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<AgentProfileDto[]> {
    await this.membership.assert(account.id, workspaceId);
    return this.agents.profiles.find(workspaceId);
  }

  @Query(() => AgentProfileType, { name: 'agentProfile' })
  public async agentProfile(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AgentProfileDto> {
    await this.membership.assert(account.id, workspaceId);
    return this.agents.profiles.getById(workspaceId, id);
  }

  @Mutation(() => AgentProfileType, { name: 'createAgentProfile' })
  public async createAgentProfile(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args(
      'input',
      { type: () => CreateAgentProfileInput },
      new SchemaPipe(CreateAgentProfileDtoSchema),
    )
    input: CreateAgentProfileDto,
  ): Promise<AgentProfileDto> {
    await this.membership.assert(account.id, workspaceId);
    return this.agents.profiles.create(workspaceId, input);
  }

  @Mutation(() => AgentProfileType, { name: 'updateAgentProfile' })
  public async updateAgentProfile(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args(
      'input',
      { type: () => UpdateAgentProfileInput },
      new SchemaPipe(UpdateAgentProfileDtoSchema),
    )
    input: UpdateAgentProfileDto,
  ): Promise<AgentProfileDto> {
    await this.membership.assert(account.id, workspaceId);
    return this.agents.profiles.update(workspaceId, id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteAgentProfile' })
  public async deleteAgentProfile(
    @CurrentAccount() account: AuthenticatedAccount,
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.membership.assert(account.id, workspaceId);
    await this.agents.profiles.delete(workspaceId, id);
    return true;
  }
}
