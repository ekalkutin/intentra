import { ConfigurableModuleBuilder } from '@nestjs/common';

export type WorkspaceModuleOptions = {
  readonly database: {
    /** Postgres URL of Workspace's own database. */
    readonly url: string;
  };
};

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: WORKSPACE_OPTIONS,
} = new ConfigurableModuleBuilder<WorkspaceModuleOptions>().build();
