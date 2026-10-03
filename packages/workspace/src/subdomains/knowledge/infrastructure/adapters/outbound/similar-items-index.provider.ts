import type { Provider } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

import { SimilarItemsIndex } from '../../../application/ports/outbound/index.js';
import {
  KNOWLEDGE_OPTIONS,
  type KnowledgeOptions,
} from '../../runtime/index.js';

import { InMemorySimilarItemsIndexAdapter } from './in-memory-similar-items-index.adapter.js';
import {
  QdrantSimilarItemsIndexAdapter,
  similarItemsCollection,
} from './qdrant-similar-items-index.adapter.js';

/** Qdrant when the server is given its address, this process's memory otherwise. */
export const SIMILAR_ITEMS_INDEX_PROVIDER: Provider = {
  provide: SimilarItemsIndex,
  inject: [KNOWLEDGE_OPTIONS],
  useFactory: ({ qdrantUrl, embeddingModelId }: KnowledgeOptions) =>
    qdrantUrl
      ? new QdrantSimilarItemsIndexAdapter(
          new QdrantClient({ url: qdrantUrl, checkCompatibility: false }),
          similarItemsCollection(embeddingModelId),
        )
      : new InMemorySimilarItemsIndexAdapter(),
};
