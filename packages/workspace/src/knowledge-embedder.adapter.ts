import { Inject, Injectable } from '@nestjs/common';
import { embedMany } from 'ai';

import type { WorkspaceId } from '@intentra/shared-kernel';

import {
  ProviderKeyCipher,
  ProviderKeyRepository,
} from './subdomains/agents/index.js';
import {
  KNOWLEDGE_OPTIONS,
  type KnowledgeEmbedder,
  type KnowledgeOptions,
} from './subdomains/knowledge/index.js';

/** How many times a call its provider failed for a while is tried again. */
const MAX_RETRIES = 3;

/**
 * Reads meaning for Knowledge on the Workspace's Provider Key, which the
 * Agents subdomain keeps: wired here so that Knowledge never reaches into
 * Agents (Knowledge ADR 0003).
 */
@Injectable()
export class KnowledgeEmbedderAdapter implements KnowledgeEmbedder {
  constructor(
    @Inject(KNOWLEDGE_OPTIONS) private readonly options: KnowledgeOptions,
    private readonly providerKeyRepository: ProviderKeyRepository,
    private readonly providerKeyCipher: ProviderKeyCipher,
  ) {}

  public async embed(
    workspaceId: WorkspaceId,
    texts: readonly string[],
  ): Promise<number[][] | null> {
    const key = await this.providerKeyRepository.findOne({ workspaceId });
    if (!key) {
      return null;
    }
    if (texts.length === 0) {
      return [];
    }
    const secret = this.providerKeyCipher.decrypt(key.encryptedKey);
    const { embeddings } = await embedMany({
      model: this.options.embeddingModel(
        this.options.embeddingModelId,
        secret.value,
      ),
      values: [...texts],
      maxRetries: MAX_RETRIES,
    });

    return embeddings;
  }
}
