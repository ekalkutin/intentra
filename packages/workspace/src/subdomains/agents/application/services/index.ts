import { Provider } from '@nestjs/common';

import { AnalysisRunsService } from './analysis-runs.service.js';
import { ConversationsService } from './conversations.service.js';
import { PlatformAgentsService } from './platform-agents.service.js';
import { ProviderKeyService } from './provider-key.service.js';

export {
  AnalysisRunsService,
  ConversationsService,
  PlatformAgentsService,
  ProviderKeyService,
};

export const APPLICATION_SERVICES: Provider[] = [
  AnalysisRunsService,
  ConversationsService,
  PlatformAgentsService,
  ProviderKeyService,
];
