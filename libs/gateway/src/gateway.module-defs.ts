import { ConfigurableModuleBuilder, type ModuleMetadata } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import {
  GATEWAY_OPTIONS,
  type GatewayModuleOptions,
} from './gateway.options.js';
import { AgentsModule } from './presentation/agents/agents.module.js';
import { McpModule } from './presentation/mcp/mcp.module.js';
import { RestModule } from './presentation/rest/rest.module.js';

type GatewayModuleExtras = {
  readonly contexts: NonNullable<ModuleMetadata['imports']>;
};

export const { ConfigurableModuleClass } =
  new ConfigurableModuleBuilder<GatewayModuleOptions>({
    optionsInjectionToken: GATEWAY_OPTIONS,
  })
    .setExtras<GatewayModuleExtras>({ contexts: [] }, (definition, extras) => ({
      ...definition,
      // Global, so that the modules below can inject GATEWAY_OPTIONS.
      global: true,
      exports: [...(definition.exports ?? []), GATEWAY_OPTIONS],
      imports: [
        ...(definition.imports ?? []),
        RestModule.register(extras),
        McpModule.register(extras),
        AgentsModule.register(extras),
        RouterModule.register([
          { path: 'api', children: [RestModule, McpModule, AgentsModule] },
        ]),
      ],
    }))
    .build();
