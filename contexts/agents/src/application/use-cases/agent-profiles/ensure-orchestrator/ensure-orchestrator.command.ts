import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { WorkspaceId } from '@intentra/shared';

import {
  AGENTS_OPTIONS,
  type AgentsModuleOptions,
} from '../../../../agents.module-definition.js';
import { AgentProfile } from '../../../../domain/entities/index.js';
import { ModelId } from '../../../../domain/value-objects/index.js';
import { AgentProfileRepository } from '../../../ports/index.js';

/** Makes the orchestrator of the workspace unless it has one. */
export class EnsureOrchestratorCommand extends Command<string> {
  constructor(public readonly workspaceId: string) {
    super();
  }
}

@CommandHandler(EnsureOrchestratorCommand)
export class EnsureOrchestratorCommandHandler implements ICommandHandler<EnsureOrchestratorCommand> {
  constructor(
    @Inject(AgentProfileRepository)
    private readonly agentProfileRepository: AgentProfileRepository,

    @Inject(AGENTS_OPTIONS)
    private readonly options: AgentsModuleOptions,
  ) {}

  public async execute({
    workspaceId,
  }: EnsureOrchestratorCommand): Promise<string> {
    const id = new WorkspaceId(workspaceId);
    const existing = await this.agentProfileRepository.findOrchestrator(id);
    if (existing) {
      return existing.id.value;
    }

    await this.agentProfileRepository.addOrchestratorIfAbsent(
      AgentProfile.createOrchestrator({
        workspaceId: id,
        model: new ModelId(this.options.defaultModel),
      }),
    );
    // Another request may have added its own in the meantime.
    const orchestrator = await this.agentProfileRepository.findOrchestrator(id);
    return orchestrator!.id.value;
  }
}
