import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { WorkspaceId } from '@intentra/shared';

import { AgentProfileId } from '../../../../domain/value-objects/index.js';
import { AgentProfileRepository } from '../../../ports/index.js';

/** Archives the profile: it stays for history. */
export class DeleteAgentProfileCommand extends Command<void> {
  constructor(
    public readonly workspaceId: string,
    public readonly id: string,
  ) {
    super();
  }
}

@CommandHandler(DeleteAgentProfileCommand)
export class DeleteAgentProfileCommandHandler implements ICommandHandler<DeleteAgentProfileCommand> {
  constructor(
    @Inject(AgentProfileRepository)
    private readonly agentProfileRepository: AgentProfileRepository,
  ) {}

  public async execute({
    workspaceId,
    id,
  }: DeleteAgentProfileCommand): Promise<void> {
    const profile = await this.agentProfileRepository.getActiveById(
      new WorkspaceId(workspaceId),
      new AgentProfileId(id),
    );
    profile.archive();
    await this.agentProfileRepository.save(profile);
  }
}
