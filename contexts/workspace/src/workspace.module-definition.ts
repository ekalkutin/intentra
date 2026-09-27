import { ConfigurableModuleBuilder } from '@nestjs/common';

export type WorkspaceModuleOptions = {};

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: WORKSPACE_OPTIONS,
} = new ConfigurableModuleBuilder<WorkspaceModuleOptions>().build();
