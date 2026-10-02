import {
  DynamicModule,
  Module,
  type ModuleMetadata,
  type Provider,
} from '@nestjs/common';

import { McpController } from './mcp.controller.js';
import { McpHandler } from './mcp.handler.js';

@Module({})
export class McpModule {
  /** `providers` must include `MCP_OPTIONS`; `imports` are what those providers need. */
  static register({
    contexts,
    imports,
    providers,
  }: {
    readonly contexts: NonNullable<ModuleMetadata['imports']>;
    readonly imports: NonNullable<ModuleMetadata['imports']>;
    readonly providers: readonly Provider[];
  }): DynamicModule {
    return {
      module: McpModule,
      imports: [...contexts, ...imports],
      controllers: [McpController],
      providers: [McpHandler, ...providers],
    };
  }
}
