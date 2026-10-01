import { Provider } from '@nestjs/common';

import { ConversationsService } from './conversations.service.js';
import { ProviderKeyService } from './provider-key.service.js';

export { ConversationsService, ProviderKeyService };

export const APPLICATION_SERVICES: Provider[] = [
  ConversationsService,
  ProviderKeyService,
];
