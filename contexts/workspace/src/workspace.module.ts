import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WorkspaceApi } from '@intentra/workspace-contracts';

import { WorkspaceRepository } from './application/ports/index.js';
import {
  WorkspaceApiService,
  WorkspacesService,
} from './application/services/index.js';
import {
  WorkspaceModel,
  WorkspaceRepositoryAdapter,
  WorkspaceSchema,
} from './infrastructure/repositories/workspace/index.js';
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
    WorkspacesService,
    {
      provide: WorkspaceRepository,
      useClass: WorkspaceRepositoryAdapter,
    },
    {
      provide: WorkspaceApi,
      useClass: WorkspaceApiService,
    },
  ],
  exports: [WorkspaceApi],
})
export class WorkspaceModule extends ConfigurableModuleClass {}
