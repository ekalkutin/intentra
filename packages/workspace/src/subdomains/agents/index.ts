import type { Provider } from '@nestjs/common';

import { APPLICATION_SERVICES } from './application/services/index.js';
import { ADAPTERS } from './infrastructure/adapters/index.js';
import { MEMORY_PROVIDER } from './infrastructure/runtime/index.js';

export {
  AnalysisRunsService,
  ConversationsService,
  PlatformAgentsService,
  ProviderKeyService,
} from './application/services/index.js';
export {
  AnalysisRunRepository,
  AnalysisScheduleRepository,
  ConversationStore,
  ProviderKeyCipher,
  ProviderKeyRepository,
} from './application/ports/outbound/index.js';
export { DatabaseModule as AgentsDatabaseModule } from './infrastructure/database/index.js';
export {
  AGENTS_OPTIONS,
  DEFAULT_AGENTS_OPTIONS,
  type AgentsOptions,
} from './infrastructure/runtime/index.js';

/** Intentra's own Agents: Conversations with Intentra, on the Workspace's Provider Key. */
export const AGENTS_PROVIDERS: Provider[] = [
  ...APPLICATION_SERVICES,
  ...ADAPTERS,
  MEMORY_PROVIDER,
];
