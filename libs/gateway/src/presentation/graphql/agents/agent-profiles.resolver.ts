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
  ) {}

  @Query(() => [AgentProfileType], { name: 'agentProfiles' })
  public agentProfiles(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
  ): Promise<AgentProfileDto[]> {
    return this.agents.profiles.find(workspaceId);
  }

  /** `null` when there is no such profile in the workspace. */
  @Query(() => AgentProfileType, { name: 'agentProfile', nullable: true })
  public agentProfile(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AgentProfileDto | null> {
    return this.agents.profiles.findById(workspaceId, id);
  }

  @Mutation(() => AgentProfileType, { name: 'createAgentProfile' })
  public createAgentProfile(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args(
      'input',
      { type: () => CreateAgentProfileInput },
      new SchemaPipe(CreateAgentProfileDtoSchema),
    )
    input: CreateAgentProfileDto,
  ): Promise<AgentProfileDto> {
    return this.agents.profiles.create(workspaceId, input);
  }

  /** `null` when there is no such profile in the workspace. */
  @Mutation(() => AgentProfileType, {
    name: 'updateAgentProfile',
    nullable: true,
  })
  public updateAgentProfile(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args(
      'input',
      { type: () => UpdateAgentProfileInput },
      new SchemaPipe(UpdateAgentProfileDtoSchema),
    )
    input: UpdateAgentProfileDto,
  ): Promise<AgentProfileDto | null> {
    return this.agents.profiles.update(workspaceId, id, input);
  }

  /** Idempotent: deleting a missing profile still returns `true`. */
  @Mutation(() => Boolean, { name: 'deleteAgentProfile' })
  public async deleteAgentProfile(
    @Args('workspaceId', { type: () => ID }) workspaceId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.agents.profiles.delete(workspaceId, id);
    return true;
  }
}
