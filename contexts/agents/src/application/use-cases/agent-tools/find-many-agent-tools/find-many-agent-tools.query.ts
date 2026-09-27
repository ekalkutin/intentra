import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type { AgentToolDto } from '@intentra/contracts/agents';

import { ToolCatalog } from '../../../ports/index.js';

export class FindManyAgentToolsQuery extends Query<AgentToolDto[]> {}

@QueryHandler(FindManyAgentToolsQuery)
export class FindManyAgentToolsQueryHandler implements IQueryHandler<FindManyAgentToolsQuery> {
  constructor(
    @Inject(ToolCatalog)
    private readonly toolCatalog: ToolCatalog,
  ) {}

  public async execute(): Promise<AgentToolDto[]> {
    return this.toolCatalog.find().map(tool => ({
      id: tool.id,
      description: tool.description,
    }));
  }
}
