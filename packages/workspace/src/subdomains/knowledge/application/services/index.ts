import { Provider } from '@nestjs/common';

import { KnowledgeService } from './knowledge.service.js';
import { SimilarItemsService } from './similar-items.service.js';

export { KnowledgeService };

export const APPLICATION_SERVICES: Provider[] = [
  KnowledgeService,
  SimilarItemsService,
];
