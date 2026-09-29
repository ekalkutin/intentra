import { Provider } from '@nestjs/common';

import { KnowledgeService } from './knowledge.service.js';

export { KnowledgeService };

export const APPLICATION_SERVICES: Provider[] = [KnowledgeService];
