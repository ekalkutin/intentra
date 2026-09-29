import { Provider } from '@nestjs/common';

import { KNOWLEDGE_ITEM_REPOSITORY_PROVIDER } from './outbound/knowledge-item-repository.adapter.js';
import { KNOWLEDGE_KEY_COUNTER_PROVIDER } from './outbound/knowledge-key-counter.adapter.js';

export const ADAPTERS: Provider[] = [
  KNOWLEDGE_ITEM_REPOSITORY_PROVIDER,
  KNOWLEDGE_KEY_COUNTER_PROVIDER,
];
