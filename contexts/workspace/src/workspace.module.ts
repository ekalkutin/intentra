import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WorkspaceApi } from '@intentra/workspace-contracts';

import { WorkspaceRepository } from './application/ports/workspace.repository.js';
import {
  WorkspaceModel,
  WorkspaceRepositoryAdapter,
  WorkspaceSchema,
} from './infrastructure/repositories/workspace/index.js';
import { WorkspaceApiAdapter } from './presentation/workspace.api-adapter.js';
import { ConfigurableModuleClass } from './workspace.module-defs.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WorkspaceModel.name,
        schema: WorkspaceSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: WorkspaceRepository,
      useClass: WorkspaceRepositoryAdapter,
    },
    {
      provide: WorkspaceApi,
      useClass: WorkspaceApiAdapter,
    },
  ],
  exports: [WorkspaceApi],
})
export class WorkspaceModule extends ConfigurableModuleClass {}
