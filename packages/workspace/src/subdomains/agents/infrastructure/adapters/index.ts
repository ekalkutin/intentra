import { Provider } from '@nestjs/common';

import { CONVERSATION_STORE_PROVIDER } from './outbound/conversation-store.adapter.js';
import { ORCHESTRATOR_PROVIDER } from './outbound/orchestrator.adapter.js';

export const ADAPTERS: Provider[] = [
  CONVERSATION_STORE_PROVIDER,
  ORCHESTRATOR_PROVIDER,
];
