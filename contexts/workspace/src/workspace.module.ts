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
import { ProjectRepository } from './subdomains/projects/application/ports/project.repository.js';
import { ProjectsService } from './subdomains/projects/application/services/projects.service.js';
import {
  ProjectModel,
  ProjectRepositoryAdapter,
  ProjectSchema,
} from './subdomains/projects/infrastructure/repositories/project/index.js';
import { ConfigurableModuleClass } from './workspace.module-defs.js';

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
    WorkspacesService,
    ProjectsService,
    {
      provide: WorkspaceRepository,
      useClass: WorkspaceRepositoryAdapter,
    },
    {
      provide: WorkspaceApi,
      useClass: WorkspaceApiService,
    },

    {
      provide: ProjectRepository,
      useClass: ProjectRepositoryAdapter,
    },
  ],
  exports: [WorkspaceApi],
})
export class WorkspaceModule extends ConfigurableModuleClass {}
