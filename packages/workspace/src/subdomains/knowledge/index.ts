import type { Provider } from '@nestjs/common';

import { APPLICATION_SERVICES } from './application/services/index.js';
import { ADAPTERS } from './infrastructure/adapters/index.js';

export { KnowledgeService } from './application/services/index.js';
export {
  KnowledgeEmbedder,
  KnowledgeItemRepository,
  KnowledgeKeyCounter,
  SimilarItemsIndex,
} from './application/ports/outbound/index.js';
export { DatabaseModule as KnowledgeDatabaseModule } from './infrastructure/database/index.js';
export {
  DEFAULT_KNOWLEDGE_OPTIONS,
  KNOWLEDGE_OPTIONS,
  type KnowledgeOptions,
} from './infrastructure/runtime/index.js';

/** The structured model of what a Project is: Knowledge Items, their Knowledge Keys and their Similar Items. */
export const KNOWLEDGE_PROVIDERS: Provider[] = [
  ...APPLICATION_SERVICES,
  ...ADAPTERS,
];
