import { ConfigurableModuleBuilder } from '@nestjs/common';

import type { AgentsOptions } from './subdomains/agents/index.js';

export type WorkspaceModuleOptions = {
  /** Intentra's own Agents; without a model, sending them a message answers 503. */
  readonly agents?: Partial<AgentsOptions>;
};

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: WORKSPACE_OPTIONS,
} = new ConfigurableModuleBuilder<WorkspaceModuleOptions>().build();
