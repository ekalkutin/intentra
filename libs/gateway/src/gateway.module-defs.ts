import { ConfigurableModuleBuilder, type ModuleMetadata } from '@nestjs/common';

import { RestModule } from './presentation/rest/rest.module.js';

export type GatewayModuleOptions = {};
type GatewayModuleExtras = {
  readonly contexts: NonNullable<ModuleMetadata['imports']>;
};

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: GATEWAY_OPTIONS,
} = new ConfigurableModuleBuilder<GatewayModuleOptions>()
  .setExtras<GatewayModuleExtras>({ contexts: [] }, (definition, extras) => ({
    ...definition,
    imports: [...(definition.imports ?? []), RestModule.register(extras)],
  }))
  .build();
