import { ConfigurableModuleBuilder } from '@nestjs/common';

export type AgentsModuleOptions = {
  readonly database: {
    /** Postgres URL of Agents' own database. */
    readonly url: string;
  };
};

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: AGENTS_OPTIONS } =
  new ConfigurableModuleBuilder<AgentsModuleOptions>()
    // Global so the context's feature modules (profiles) can inject
    // AgentsDatabase. Nothing outside Agents can name that token.
    .setExtras({}, definition => ({ ...definition, global: true }))
    .build();
