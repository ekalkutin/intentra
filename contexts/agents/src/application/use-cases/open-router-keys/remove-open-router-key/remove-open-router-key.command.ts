import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { WorkspaceId } from '@intentra/shared';

import { OpenRouterKeyNotFoundException } from '../../../exceptions/index.js';
import { OpenRouterKeyRepository } from '../../../ports/index.js';

export class RemoveOpenRouterKeyCommand extends Command<void> {
  constructor(public readonly workspaceId: string) {
    super();
  }
}

@CommandHandler(RemoveOpenRouterKeyCommand)
export class RemoveOpenRouterKeyCommandHandler implements ICommandHandler<RemoveOpenRouterKeyCommand> {
  constructor(
    @Inject(OpenRouterKeyRepository)
    private readonly openRouterKeyRepository: OpenRouterKeyRepository,
  ) {}

  public async execute({
    workspaceId,
  }: RemoveOpenRouterKeyCommand): Promise<void> {
    const removed = await this.openRouterKeyRepository.remove(
      new WorkspaceId(workspaceId),
    );
    if (!removed) {
      throw new OpenRouterKeyNotFoundException(workspaceId);
    }
  }
}
