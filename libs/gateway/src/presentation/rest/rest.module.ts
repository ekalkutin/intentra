import {
  Module,
  type DynamicModule,
  type ModuleMetadata,
} from '@nestjs/common';

import { AuthController } from './iam/auth.controller.js';

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
      controllers: [AuthController],
    };
  }
}
