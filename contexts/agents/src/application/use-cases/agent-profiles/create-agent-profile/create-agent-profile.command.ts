import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { CreateAgentProfileDto } from '@intentra/contracts/agents';
import { WorkspaceId } from '@intentra/shared';

import { AgentProfile } from '../../../../domain/entities/index.js';
import {
  AgentDescription,
  AgentName,
  Instructions,
  ModelId,
} from '../../../../domain/value-objects/index.js';
import { AgentProfileRepository, ToolCatalog } from '../../../ports/index.js';

/** Creates a specialist: the orchestrator is made by the workspace itself. */
export class CreateAgentProfileCommand extends Command<string> {
  constructor(
    public readonly workspaceId: string,
    public readonly payload: CreateAgentProfileDto,
  ) {
    super();
  }
}

@CommandHandler(CreateAgentProfileCommand)
export class CreateAgentProfileCommandHandler implements ICommandHandler<CreateAgentProfileCommand> {
  constructor(
    @Inject(AgentProfileRepository)
    private readonly agentProfileRepository: AgentProfileRepository,

    @Inject(ToolCatalog)
    private readonly toolCatalog: ToolCatalog,
  ) {}

  public async execute({
    workspaceId,
    payload,
  }: CreateAgentProfileCommand): Promise<string> {
    const profile = AgentProfile.createSpecialist({
      workspaceId: new WorkspaceId(workspaceId),
      name: new AgentName(payload.name),
      description: new AgentDescription(payload.description),
      instructions: new Instructions(payload.instructions),
      model: new ModelId(payload.model),
    });
    profile.replaceTools(
      this.toolCatalog.requireAvailable(payload.tools ?? []),
    );

    await this.agentProfileRepository.save(profile);
    return profile.id.value;
  }
}
