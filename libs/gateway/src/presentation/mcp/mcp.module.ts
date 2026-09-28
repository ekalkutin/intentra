import { DynamicModule, Module, type ModuleMetadata } from '@nestjs/common';

import { McpController } from './mcp.controller.js';
import { McpHandler } from './mcp.handler.js';

@Module({})
export class McpModule {
  static register({
    contexts,
  }: {
    readonly contexts: NonNullable<ModuleMetadata['imports']>;
  }): DynamicModule {
    return {
      module: McpModule,
      imports: [...contexts],
      controllers: [McpController],
      providers: [McpHandler],
    };
  }
}
