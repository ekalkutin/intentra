import { ConfigurableModuleBuilder } from '@nestjs/common';
import { APP_INTERCEPTOR, RouterModule } from '@nestjs/core';

import { AuthModule } from './presentation/auth/index.js';
import { ExceptionsInterceptor } from './presentation/exceptions/index.js';
import { GQLModule } from './presentation/graphql/gql.module.js';
import { McpModule } from './presentation/mcp/mcp.module.js';
import type { PresentationModuleOptions } from './presentation/presentation-module.options.js';
import { RestModule } from './presentation/rest/rest.module.js';

// Options of the gateway itself. Empty for now.
export type GatewayModuleOptions = {};

// Extras: modules that provide the context ports (IamApi, WorkspaceApi, ...).
// The composition root decides: local context modules or transport clients.
type GatewayModuleExtras = Pick<PresentationModuleOptions, 'contexts'>;

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: GATEWAY_OPTIONS,
} = new ConfigurableModuleBuilder<GatewayModuleOptions>()
  .setExtras<GatewayModuleExtras>({ contexts: [] }, (definition, extras) => {
    // One object for every protocol: a second one would guard twice.
    const auth = AuthModule.register({ contexts: extras.contexts });
    const presentation = { contexts: extras.contexts, auth };

    return {
      ...definition,
      imports: [
        ...(definition.imports ?? []),
        auth,
        RestModule.register(presentation),
        McpModule.register(presentation),
        GQLModule.register(presentation),
        // The gateway owns its URLs: every protocol is served under one prefix.
        RouterModule.register([
          { path: 'api', children: [RestModule, McpModule, GQLModule] },
        ]),
      ],
      providers: [
        ...(definition.providers ?? []),
        { provide: APP_INTERCEPTOR, useClass: ExceptionsInterceptor },
      ],
    };
  })
  .build();
