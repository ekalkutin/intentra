import type { Provider } from '@nestjs/common';

import { APPLICATION_SERVICES } from './application/services/index.js';
import { ADAPTERS } from './infrastructure/adapters/index.js';

export { KnowledgeService } from './application/services/index.js';
export {
  KnowledgeItemRepository,
  KnowledgeKeyCounter,
} from './application/ports/outbound/index.js';
export { DatabaseModule as KnowledgeDatabaseModule } from './infrastructure/database/index.js';

/** The structured model of what a Project is: Knowledge Items and their Knowledge Keys. */
export const KNOWLEDGE_PROVIDERS: Provider[] = [
  ...APPLICATION_SERVICES,
  ...ADAPTERS,
];
