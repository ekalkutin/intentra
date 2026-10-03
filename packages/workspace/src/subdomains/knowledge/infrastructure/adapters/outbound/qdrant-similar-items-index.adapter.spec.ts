import { describe, expect, it } from 'vitest';

import { similarItemsCollection } from './qdrant-similar-items-index.adapter.js';

describe('similarItemsCollection', () => {
  it('names one collection per embedding model', () => {
    // Arrange
    const modelId = 'openai/text-embedding-3-small';

    // Act
    const collection = similarItemsCollection(modelId);

    // Assert
    expect(collection).toBe('knowledge_items__openai_text_embedding_3_small');
  });
});
