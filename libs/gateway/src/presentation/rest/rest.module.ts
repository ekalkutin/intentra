import { DynamicModule, Module } from '@nestjs/common';

import type { PresentationModuleOptions } from '../presentation-module.options.js';

import { IAM_CONTROLLERS } from './iam/index.js';

@Module({})
export class RestModule {
  static register({ contexts }: PresentationModuleOptions): DynamicModule {
    return {
      module: RestModule,
      imports: contexts,
      controllers: [...IAM_CONTROLLERS],
    };
  }
}
