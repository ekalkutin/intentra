import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type { AgentProfileDto } from '@intentra/contracts/agents';
import { WorkspaceId } from '@intentra/shared';

import { AgentProfileRepository } from '../../../ports/index.js';

export class FindManyAgentProfilesQuery extends Query<AgentProfileDto[]> {
  constructor(public readonly workspaceId: string) {
    super();
  }
}

@QueryHandler(FindManyAgentProfilesQuery)
export class FindManyAgentProfilesQueryHandler implements IQueryHandler<FindManyAgentProfilesQuery> {
  constructor(
    @Inject(AgentProfileRepository)
    private readonly agentProfileRepository: AgentProfileRepository,
  ) {}

  public async execute({
    workspaceId,
  }: FindManyAgentProfilesQuery): Promise<AgentProfileDto[]> {
    const profiles = await this.agentProfileRepository.findActiveByWorkspace(
      new WorkspaceId(workspaceId),
    );
    return profiles.map(profile => ({
      id: profile.id.value,
      workspaceId: profile.workspaceId.value,
      name: profile.name.value,
      instructions: profile.instructions.value,
      model: { provider: profile.model.provider, name: profile.model.name },
      tools: profile.tools.map(tool => tool.value),
    }));
  }
}
