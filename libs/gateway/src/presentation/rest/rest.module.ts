import { DynamicModule, Module } from '@nestjs/common';

import type { PresentationModuleOptions } from '../presentation-module.options.js';

import { AGENTS_CONTROLLERS } from './agents/index.js';
import { IAM_CONTROLLERS } from './iam/index.js';
import { WORKSPACE_CONTROLLERS } from './workspace/index.js';

@Module({})
export class RestModule {
  static register({
    contexts,
    auth,
  }: PresentationModuleOptions): DynamicModule {
    return {
      module: RestModule,
      imports: [...contexts, auth],
      controllers: [
        ...IAM_CONTROLLERS,
        ...WORKSPACE_CONTROLLERS,
        ...AGENTS_CONTROLLERS,
      ],
    };
  }
}
