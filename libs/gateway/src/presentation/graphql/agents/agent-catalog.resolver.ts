import { Inject } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import {
  AgentsApi,
  type AgentToolDto,
  type ModelDto,
} from '@intentra/contracts/agents';

import { AgentToolType, ModelType } from './dto/index.js';

/** What an agent profile can be built from: the same for every workspace. */
@Resolver()
export class AgentCatalogResolver {
  constructor(
    @Inject(AgentsApi)
    private readonly agents: AgentsApi,
  ) {}

  @Query(() => [ModelType], { name: 'models' })
  public models(): Promise<ModelDto[]> {
    return this.agents.models.find();
  }

  @Query(() => [AgentToolType], { name: 'agentTools' })
  public agentTools(): Promise<AgentToolDto[]> {
    return this.agents.tools.find();
  }
}
