import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import {
  ProjectRepository,
  WorkspaceRepository,
} from './application/ports/index.js';
import {
  ProjectsService,
  WorkspacesService,
} from './application/services/index.js';
import {
  ProjectRepositoryAdapter,
  WorkspaceRepositoryAdapter,
} from './infrastructure/adapters/index.js';
import {
  ProjectModel,
  ProjectSchema,
  WorkspaceModel,
  WorkspaceSchema,
} from './infrastructure/database/index.js';
import { WorkspaceApiService } from './workspace-api.service.js';
import { ConfigurableModuleClass } from './workspace.module-definition.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: WorkspaceModel.name,
        schema: WorkspaceSchema,
      },
      {
        name: ProjectModel.name,
        schema: ProjectSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: WorkspaceApi,
      useClass: WorkspaceApiService,
    },
    WorkspacesService,
    ProjectsService,
    {
      provide: WorkspaceRepository,
      useClass: WorkspaceRepositoryAdapter,
    },
    {
      provide: ProjectRepository,
      useClass: ProjectRepositoryAdapter,
    },
  ],
  exports: [WorkspaceApi],
})
export class WorkspaceModule extends ConfigurableModuleClass {}
