import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { ChatStreamParams } from '@intentra/contracts/agents';
import { WorkspaceId } from '@intentra/shared';

import { ApiKey } from '../../../../domain/value-objects/index.js';
import {
  AgentProfileRepository,
  AgentRuntime,
  OpenRouterKeyRepository,
  SecretCipher,
} from '../../../ports/index.js';

/**
 * The one command that returns more than an id: its result is the answer
 * itself, which cannot be read back later. Expects the orchestrator to exist.
 */
export class StreamChatCommand extends Command<ReadableStream<Uint8Array>> {
  constructor(public readonly params: ChatStreamParams) {
    super();
  }
}

@CommandHandler(StreamChatCommand)
export class StreamChatCommandHandler implements ICommandHandler<StreamChatCommand> {
  constructor(
    @Inject(AgentProfileRepository)
    private readonly agentProfileRepository: AgentProfileRepository,

    @Inject(OpenRouterKeyRepository)
    private readonly openRouterKeyRepository: OpenRouterKeyRepository,

    @Inject(SecretCipher)
    private readonly secretCipher: SecretCipher,

    @Inject(AgentRuntime)
    private readonly agentRuntime: AgentRuntime,
  ) {}

  public async execute({
    params,
  }: StreamChatCommand): Promise<ReadableStream<Uint8Array>> {
    const workspaceId = new WorkspaceId(params.workspaceId);
    const key = await this.openRouterKeyRepository.getByWorkspace(workspaceId);
    const profiles =
      await this.agentProfileRepository.findActiveByWorkspace(workspaceId);
    const orchestrator = profiles.find(profile => profile.role.isOrchestrator);
    if (!orchestrator) {
      throw new Error(`Workspace ${workspaceId.value} has no orchestrator`);
    }

    return this.agentRuntime.stream({
      orchestrator,
      specialists: profiles.filter(profile => profile !== orchestrator),
      apiKey: new ApiKey(this.secretCipher.decrypt(key.key.ciphertext)),
      accountId: params.accountId,
      request: params.request,
      abortSignal: params.abortSignal,
    });
  }
}
