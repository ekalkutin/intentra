import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import type { AgentToolDto, AgentToolsApi } from '@intentra/contracts/agents';

import { FindManyAgentToolsQuery } from '../use-cases/agent-tools/index.js';

@Injectable()
export class AgentToolsService implements AgentToolsApi {
  constructor(
    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  public find(): Promise<AgentToolDto[]> {
    return this.queryBus.execute(new FindManyAgentToolsQuery());
  }
}
