import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import type { EmbeddingModel } from 'ai';

/** How the server finds Similar Items. */
export type KnowledgeOptions = {
  /** The embedding model with this id on the Workspace's Provider Key. */
  readonly embeddingModel: (
    modelId: string,
    providerKey: string,
  ) => EmbeddingModel;
  /**
   * Which embedding model reads the meaning of Knowledge Items, an OpenRouter
   * id. Another one starts the index anew: vectors of different models never
   * mix.
   */
  readonly embeddingModelId: string;
  /** Where Qdrant listens; null keeps the index in this process's memory, to be rebuilt after a restart. */
  readonly qdrantUrl: string | null;
};

export const DEFAULT_KNOWLEDGE_OPTIONS: KnowledgeOptions = {
  embeddingModel: (modelId, providerKey) =>
    createOpenRouter({ apiKey: providerKey }).textEmbeddingModel(modelId),
  embeddingModelId: 'openai/text-embedding-3-small',
  qdrantUrl: null,
};

export const KNOWLEDGE_OPTIONS = Symbol('KNOWLEDGE_OPTIONS');
