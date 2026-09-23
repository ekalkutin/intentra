import { DynamicModule, Module } from '@nestjs/common';

import type { PresentationModuleOptions } from '../presentation-module.options.js';

@Module({})
export class GQLModule {
  static register({ contexts }: PresentationModuleOptions): DynamicModule {
    return {
      module: GQLModule,
      imports: contexts,
    };
  }
}
