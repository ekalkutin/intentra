import { ConfigurableModuleBuilder } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { GQLModule } from './presentation/graphql/gql.module.js';
import { McpModule } from './presentation/mcp/mcp.module.js';
import type { PresentationModuleOptions } from './presentation/presentation-module.options.js';
import { RestModule } from './presentation/rest/rest.module.js';

// Options of the gateway itself. Empty for now.
export type GatewayModuleOptions = {};

// Extras: modules that provide the context ports (AccountApi, ...).
// The composition root decides: local context modules or transport clients.
type GatewayModuleExtras = PresentationModuleOptions;

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: GATEWAY_OPTIONS,
} = new ConfigurableModuleBuilder<GatewayModuleOptions>()
  .setExtras<GatewayModuleExtras>({ contexts: [] }, (definition, extras) => ({
    ...definition,
    imports: [
      ...(definition.imports ?? []),
      RestModule.register({ contexts: extras.contexts }),
      McpModule.register({ contexts: extras.contexts }),
      GQLModule.register({ contexts: extras.contexts }),
      // The gateway owns its URLs: every protocol is served under one prefix.
      RouterModule.register([
        { path: 'api', children: [RestModule, McpModule, GQLModule] },
      ]),
    ],
  }))
  .build();
