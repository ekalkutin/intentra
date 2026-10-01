import { Provider } from '@nestjs/common';

import { CONVERSATION_STORE_PROVIDER } from './outbound/conversation-store.adapter.js';
import { ORCHESTRATOR_PROVIDER } from './outbound/orchestrator.adapter.js';
import { PROVIDER_KEY_CIPHER_PROVIDER } from './outbound/provider-key-cipher.adapter.js';
import { PROVIDER_KEY_REPOSITORY_PROVIDER } from './outbound/provider-key-repository.adapter.js';
import { PROVIDER_KEY_VERIFIER_PROVIDER } from './outbound/provider-key-verifier.adapter.js';

export const ADAPTERS: Provider[] = [
  CONVERSATION_STORE_PROVIDER,
  ORCHESTRATOR_PROVIDER,
  PROVIDER_KEY_REPOSITORY_PROVIDER,
  PROVIDER_KEY_CIPHER_PROVIDER,
  PROVIDER_KEY_VERIFIER_PROVIDER,
];
