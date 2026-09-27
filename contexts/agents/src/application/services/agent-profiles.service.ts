import { Inject, Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import type {
  AgentProfileDto,
  AgentProfilesApi,
  CreateAgentProfileDto,
  UpdateAgentProfileDto,
} from '@intentra/contracts/agents';

import {
  CreateAgentProfileCommand,
  DeleteAgentProfileCommand,
  FindManyAgentProfilesQuery,
  GetOneAgentProfileQuery,
  UpdateAgentProfileCommand,
} from '../use-cases/agent-profiles/index.js';

@Injectable()
export class AgentProfilesService implements AgentProfilesApi {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,

    @Inject(QueryBus)
    private readonly queryBus: QueryBus,
  ) {}

  public async create(
    workspaceId: string,
    data: CreateAgentProfileDto,
  ): Promise<AgentProfileDto> {
    const id = await this.commandBus.execute(
      new CreateAgentProfileCommand(workspaceId, data),
    );
    return this.getById(workspaceId, id);
  }

  public find(workspaceId: string): Promise<AgentProfileDto[]> {
    return this.queryBus.execute(new FindManyAgentProfilesQuery(workspaceId));
  }

  public getById(workspaceId: string, id: string): Promise<AgentProfileDto> {
    return this.queryBus.execute(new GetOneAgentProfileQuery(workspaceId, id));
  }

  public async update(
    workspaceId: string,
    id: string,
    data: UpdateAgentProfileDto,
  ): Promise<AgentProfileDto> {
    await this.commandBus.execute(
      new UpdateAgentProfileCommand(workspaceId, id, data),
    );
    return this.getById(workspaceId, id);
  }

  public delete(workspaceId: string, id: string): Promise<void> {
    return this.commandBus.execute(
      new DeleteAgentProfileCommand(workspaceId, id),
    );
  }
}
