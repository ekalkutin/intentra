import { Inject } from '@nestjs/common';
import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import type { SetOpenRouterKeyDto } from '@intentra/contracts/agents';
import { WorkspaceId } from '@intentra/shared';

import { OpenRouterKey } from '../../../../domain/entities/index.js';
import {
  ApiKey,
  EncryptedApiKey,
} from '../../../../domain/value-objects/index.js';
import { OpenRouterKeyRepository, SecretCipher } from '../../../ports/index.js';

/** Returns the workspace id: the key is found by it. */
export class SetOpenRouterKeyCommand extends Command<string> {
  constructor(
    public readonly workspaceId: string,
    public readonly payload: SetOpenRouterKeyDto,
  ) {
    super();
  }
}

@CommandHandler(SetOpenRouterKeyCommand)
export class SetOpenRouterKeyCommandHandler implements ICommandHandler<SetOpenRouterKeyCommand> {
  constructor(
    @Inject(OpenRouterKeyRepository)
    private readonly openRouterKeyRepository: OpenRouterKeyRepository,

    @Inject(SecretCipher)
    private readonly secretCipher: SecretCipher,
  ) {}

  public async execute({
    workspaceId,
    payload,
  }: SetOpenRouterKeyCommand): Promise<string> {
    const id = new WorkspaceId(workspaceId);
    const apiKey = new ApiKey(payload.apiKey);
    const encrypted = new EncryptedApiKey(
      this.secretCipher.encrypt(apiKey.value),
      apiKey.hint,
    );

    const existing = await this.openRouterKeyRepository.findByWorkspace(id);
    const key = existing ?? OpenRouterKey.create(id, encrypted);
    if (existing) {
      existing.replace(encrypted);
    }

    await this.openRouterKeyRepository.save(key);
    return id.value;
  }
}
