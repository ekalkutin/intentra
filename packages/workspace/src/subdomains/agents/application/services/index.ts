import { Provider } from '@nestjs/common';

import { ConversationsService } from './conversations.service.js';
import { PlatformAgentsService } from './platform-agents.service.js';
import { ProviderKeyService } from './provider-key.service.js';

export { ConversationsService, PlatformAgentsService, ProviderKeyService };

export const APPLICATION_SERVICES: Provider[] = [
  ConversationsService,
  PlatformAgentsService,
  ProviderKeyService,
];
