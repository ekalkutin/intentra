import {
  Module,
  StandardSchemaValidationPipe,
  type DynamicModule,
  type ModuleMetadata,
} from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { ActorGuard, PlatformAdminGuard } from './auth/index.js';
import { ExceptionsFilter } from './errors/index.js';
import { IAM_CONTROLLERS } from './iam/index.js';
import { PLATFORM_CONTROLLERS } from './platform/index.js';
import { WORKSPACE_CONTROLLERS } from './workspace/index.js';

@Module({})
export class RestModule {
  static register({
    contexts,
  }: {
    readonly contexts: NonNullable<ModuleMetadata['imports']>;
  }): DynamicModule {
    return {
      module: RestModule,
      imports: [...contexts],
      controllers: [
        ...IAM_CONTROLLERS,
        ...WORKSPACE_CONTROLLERS,
        ...PLATFORM_CONTROLLERS,
      ],
      providers: [
        ActorGuard,
        PlatformAdminGuard,
        { provide: APP_PIPE, useClass: StandardSchemaValidationPipe },
        { provide: APP_FILTER, useClass: ExceptionsFilter },
      ],
    };
  }
}
