import { ConfigurableModuleBuilder, type ModuleMetadata } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import {
  MCP_OPTIONS,
  type McpOptions,
} from './presentation/mcp/mcp-options.js';
import { McpModule } from './presentation/mcp/mcp.module.js';
import {
  OAUTH_OPTIONS,
  oauthUrls,
  type OAuthOptions,
} from './presentation/oauth/oauth-options.js';
import {
  OAuthDiscoveryModule,
  OAuthModule,
} from './presentation/oauth/oauth.module.js';
import { RestModule } from './presentation/rest/rest.module.js';

export type GatewayModuleOptions = {
  readonly mcp?: Omit<McpOptions, 'resourceMetadataUrl'>;
  readonly oauth?: OAuthOptions;
};
type GatewayModuleExtras = {
  readonly contexts: NonNullable<ModuleMetadata['imports']>;
};

export const GATEWAY_OPTIONS = Symbol('GATEWAY_OPTIONS');

// The options provider lives in this module, so each module below gets its own copy.
const mcpOptions = {
  provide: MCP_OPTIONS,
  inject: [GATEWAY_OPTIONS],
  useFactory: (options: GatewayModuleOptions): McpOptions => ({
    ...options.mcp,
    resourceMetadataUrl: oauthUrls(options.oauth ?? {})?.resourceMetadata,
  }),
};
const oauthOptions = {
  provide: OAUTH_OPTIONS,
  inject: [GATEWAY_OPTIONS],
  useFactory: (options: GatewayModuleOptions): OAuthOptions =>
    options.oauth ?? {},
};

export const { ConfigurableModuleClass } =
  new ConfigurableModuleBuilder<GatewayModuleOptions>({
    optionsInjectionToken: GATEWAY_OPTIONS,
  })
    .setExtras<GatewayModuleExtras>({ contexts: [] }, (definition, extras) => {
      const imports = definition.imports ?? [];
      const providers = definition.providers ?? [];

      return {
        ...definition,
        imports: [
          ...imports,
          RestModule.register(extras),
          McpModule.register({
            ...extras,
            imports,
            providers: [...providers, mcpOptions],
          }),
          OAuthModule.register({
            ...extras,
            imports,
            providers: [...providers, oauthOptions],
          }),
          OAuthDiscoveryModule.register({
            imports,
            providers: [...providers, oauthOptions],
          }),
          RouterModule.register([
            { path: 'api', children: [RestModule, McpModule, OAuthModule] },
          ]),
        ],
      };
    })
    .build();
