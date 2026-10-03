export {
  KNOWLEDGE_ITEM_ORDERS,
  KnowledgeItemRepository,
  type KnowledgeItemCount,
  type KnowledgeItemDeleteProps,
  type KnowledgeItemOrder,
  type KnowledgeItemPage,
  type KnowledgeItemQueryProps,
} from './knowledge-item-repository.port.js';
export { KnowledgeEmbedder } from './knowledge-embedder.port.js';
export { KnowledgeKeyCounter } from './knowledge-key-counter.port.js';
export {
  SimilarItemsIndex,
  type SimilarItemsIndexDeleteProps,
  type SimilarItemsIndexEntry,
  type SimilarItemsIndexMatch,
  type SimilarItemsIndexPoint,
  type SimilarItemsIndexQuery,
} from './similar-items-index.port.js';
