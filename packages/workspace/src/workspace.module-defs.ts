import { ConfigurableModuleBuilder } from '@nestjs/common';

import type { AgentsOptions } from './subdomains/agents/index.js';

export type WorkspaceModuleOptions = {
  /** Intentra's own Agents: their model and the secret that encrypts Provider Keys. */
  readonly agents?: Partial<AgentsOptions>;
};

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: WORKSPACE_OPTIONS,
} = new ConfigurableModuleBuilder<WorkspaceModuleOptions>().build();
