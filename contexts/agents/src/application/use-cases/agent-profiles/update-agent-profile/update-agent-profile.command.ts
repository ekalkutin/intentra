import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { UpdateAgentProfileDto } from '@intentra/contracts/agents';
import { WorkspaceId } from '@intentra/shared';

import {
  AgentName,
  AgentProfileId,
  Instructions,
  ModelRef,
} from '../../../../domain/value-objects/index.js';
import { AgentProfileRepository, ToolCatalog } from '../../../ports/index.js';

export class UpdateAgentProfileCommand extends Command<void> {
  constructor(
    public readonly workspaceId: string,
    public readonly id: string,
    public readonly payload: UpdateAgentProfileDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateAgentProfileCommand)
export class UpdateAgentProfileCommandHandler implements ICommandHandler<UpdateAgentProfileCommand> {
  constructor(
    @Inject(AgentProfileRepository)
    private readonly agentProfileRepository: AgentProfileRepository,

    @Inject(ToolCatalog)
    private readonly toolCatalog: ToolCatalog,
  ) {}

  public async execute({
    workspaceId,
    id,
    payload,
  }: UpdateAgentProfileCommand): Promise<void> {
    const profile = await this.agentProfileRepository.getActiveById(
      new WorkspaceId(workspaceId),
      new AgentProfileId(id),
    );

    if (payload.name !== undefined) {
      profile.rename(new AgentName(payload.name));
    }
    if (payload.instructions !== undefined) {
      profile.changeInstructions(new Instructions(payload.instructions));
    }
    if (payload.model !== undefined) {
      profile.changeModel(
        new ModelRef(payload.model.provider, payload.model.name),
      );
    }
    if (payload.tools !== undefined) {
      profile.replaceTools(this.toolCatalog.requireAvailable(payload.tools));
    }

    await this.agentProfileRepository.save(profile);
  }
}
