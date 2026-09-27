import { Inject } from '@nestjs/common';
import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';

import type { AgentProfileDto } from '@intentra/contracts/agents';
import { WorkspaceId } from '@intentra/shared';

import { AgentProfileId } from '../../../../domain/value-objects/index.js';
import { AgentProfileRepository } from '../../../ports/index.js';

export class GetOneAgentProfileQuery extends Query<AgentProfileDto> {
  constructor(
    public readonly workspaceId: string,
    public readonly id: string,
  ) {
    super();
  }
}

@QueryHandler(GetOneAgentProfileQuery)
export class GetOneAgentProfileQueryHandler implements IQueryHandler<GetOneAgentProfileQuery> {
  constructor(
    @Inject(AgentProfileRepository)
    private readonly agentProfileRepository: AgentProfileRepository,
  ) {}

  public async execute({
    workspaceId,
    id,
  }: GetOneAgentProfileQuery): Promise<AgentProfileDto> {
    const profile = await this.agentProfileRepository.getActiveById(
      new WorkspaceId(workspaceId),
      new AgentProfileId(id),
    );
    return {
      id: profile.id.value,
      workspaceId: profile.workspaceId.value,
      name: profile.name.value,
      instructions: profile.instructions.value,
      model: { provider: profile.model.provider, name: profile.model.name },
      tools: profile.tools.map(tool => tool.value),
    };
  }
}
