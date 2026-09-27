import { ConfigurableModuleBuilder } from '@nestjs/common';

export type AgentsModuleOptions = {};

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN: AGENTS_OPTIONS } =
  new ConfigurableModuleBuilder<AgentsModuleOptions>().build();
