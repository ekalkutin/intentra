import { ConfigurableModuleBuilder, type ModuleMetadata } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import {
  MCP_OPTIONS,
  type McpOptions,
} from './presentation/mcp/mcp-options.js';
import { McpModule } from './presentation/mcp/mcp.module.js';
import { RestModule } from './presentation/rest/rest.module.js';

export type GatewayModuleOptions = {
  readonly mcp?: McpOptions;
};
type GatewayModuleExtras = {
  readonly contexts: NonNullable<ModuleMetadata['imports']>;
};

export const GATEWAY_OPTIONS = Symbol('GATEWAY_OPTIONS');

export const { ConfigurableModuleClass } =
  new ConfigurableModuleBuilder<GatewayModuleOptions>({
    optionsInjectionToken: GATEWAY_OPTIONS,
  })
    .setExtras<GatewayModuleExtras>({ contexts: [] }, (definition, extras) => ({
      ...definition,
      imports: [
        ...(definition.imports ?? []),
        RestModule.register(extras),
        // The options provider lives in this module, so McpModule gets its own copy.
        McpModule.register({
          ...extras,
          imports: definition.imports ?? [],
          providers: [
            ...(definition.providers ?? []),
            {
              provide: MCP_OPTIONS,
              inject: [GATEWAY_OPTIONS],
              useFactory: (options: GatewayModuleOptions): McpOptions =>
                options.mcp ?? {},
            },
          ],
        }),
        RouterModule.register([
          { path: 'api', children: [RestModule, McpModule] },
        ]),
      ],
    }))
    .build();
