import { ConfigurableModuleBuilder } from '@nestjs/common';

import type { AgentsOptions } from './subdomains/agents/index.js';
import type { KnowledgeOptions } from './subdomains/knowledge/index.js';

export type WorkspaceModuleOptions = {
  /** Intentra's own Agents: their model and the secret that encrypts Provider Keys. */
  readonly agents?: Partial<AgentsOptions>;
  /** Similar Items: the embedding model and where the index lives. */
  readonly knowledge?: Partial<KnowledgeOptions>;
};

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: WORKSPACE_OPTIONS,
} = new ConfigurableModuleBuilder<WorkspaceModuleOptions>().build();
