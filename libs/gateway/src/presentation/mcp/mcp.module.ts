import { DynamicModule, Module } from '@nestjs/common';

import type { PresentationModuleOptions } from '../presentation-module.options.js';

import { McpController } from './mcp.controller.js';
import { McpHandler } from './mcp.handler.js';

@Module({})
export class McpModule {
  static register({ contexts }: PresentationModuleOptions): DynamicModule {
    return {
      module: McpModule,
      imports: contexts,
      controllers: [McpController],
      providers: [McpHandler],
    };
  }
}
