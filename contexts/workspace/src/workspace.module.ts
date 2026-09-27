import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import { ProjectRepository } from './application/ports/project-repository.port.js';
import { WorkspaceRepository } from './application/ports/workspace-repository.port.js';
import { ProjectsService } from './application/services/projects.service.js';
import { WorkspacesService } from './application/services/workspaces.service.js';
import { ProjectRepositoryAdapter } from './infrastructure/adapters/project-repository.adapter.js';
import { WorkspaceRepositoryAdapter } from './infrastructure/adapters/workspace-repository.adapter.js';
import {
  ProjectModel,
  ProjectSchema,
} from './infrastructure/database/project.schema.js';
import {
  WorkspaceModel,
  WorkspaceSchema,
} from './infrastructure/database/workspace.schema.js';
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
