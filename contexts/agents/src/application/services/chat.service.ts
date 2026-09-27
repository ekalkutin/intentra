import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import type { ChatApi, ChatStreamParams } from '@intentra/contracts/agents';

import { EnsureOrchestratorCommand } from '../use-cases/agent-profiles/index.js';
import { StreamChatCommand } from '../use-cases/chat/index.js';

@Injectable()
export class ChatService implements ChatApi {
  constructor(
    @Inject(CommandBus)
    private readonly commandBus: CommandBus,
  ) {}

  public async stream(
    params: ChatStreamParams,
  ): Promise<ReadableStream<Uint8Array>> {
    await this.commandBus.execute(
      new EnsureOrchestratorCommand(params.workspaceId),
    );
    return this.commandBus.execute(new StreamChatCommand(params));
  }
}
