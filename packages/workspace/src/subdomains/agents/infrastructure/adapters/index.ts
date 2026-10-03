import { Provider } from '@nestjs/common';

import { ANALYSIS_SCHEDULER_PROVIDER } from './inbound/analysis-scheduler.js';
import { AGENTS_VERSION_REPOSITORY_PROVIDER } from './outbound/agents-version-repository.adapter.js';
import { ANALYSIS_RUN_REPOSITORY_PROVIDER } from './outbound/analysis-run-repository.adapter.js';
import { ANALYSIS_SCHEDULE_REPOSITORY_PROVIDER } from './outbound/analysis-schedule-repository.adapter.js';
import { AUDITED_KNOWLEDGE_PROVIDER } from './outbound/audited-knowledge.adapter.js';
import { AUDITOR_PROVIDER } from './outbound/auditor.adapter.js';
import { CONVERSATION_STORE_PROVIDER } from './outbound/conversation-store.adapter.js';
import { INTENTRA_PROVIDER } from './outbound/intentra.adapter.js';
import { KNOWLEDGE_CHECK_REPOSITORY_PROVIDER } from './outbound/knowledge-check-repository.adapter.js';
import { PROVIDER_KEY_CIPHER_PROVIDER } from './outbound/provider-key-cipher.adapter.js';
import { PROVIDER_KEY_REPOSITORY_PROVIDER } from './outbound/provider-key-repository.adapter.js';
import { PROVIDER_KEY_VERIFIER_PROVIDER } from './outbound/provider-key-verifier.adapter.js';
import { TOOL_CATALOG_PROVIDER } from './outbound/tool-catalog.adapter.js';
import { UNPUBLISHED_AGENTS_REPOSITORY_PROVIDER } from './outbound/unpublished-agents-repository.adapter.js';

export const ADAPTERS: Provider[] = [
  CONVERSATION_STORE_PROVIDER,
  INTENTRA_PROVIDER,
  AUDITOR_PROVIDER,
  AUDITED_KNOWLEDGE_PROVIDER,
  KNOWLEDGE_CHECK_REPOSITORY_PROVIDER,
  PROVIDER_KEY_REPOSITORY_PROVIDER,
  PROVIDER_KEY_CIPHER_PROVIDER,
  PROVIDER_KEY_VERIFIER_PROVIDER,
  UNPUBLISHED_AGENTS_REPOSITORY_PROVIDER,
  AGENTS_VERSION_REPOSITORY_PROVIDER,
  ANALYSIS_RUN_REPOSITORY_PROVIDER,
  ANALYSIS_SCHEDULE_REPOSITORY_PROVIDER,
  ANALYSIS_SCHEDULER_PROVIDER,
  TOOL_CATALOG_PROVIDER,
];
