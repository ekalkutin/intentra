import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WorkspacesModule } from '../workspaces/index.js';

import { ProjectRepository } from './application/project-repository.port.js';
import { ProjectsService } from './application/projects.service.js';
import { ProjectRepositoryAdapter } from './infrastructure/project-repository.adapter.js';
import {
  ProjectModel,
  ProjectSchema,
} from './infrastructure/project.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProjectModel.name,
        schema: ProjectSchema,
      },
    ]),
    WorkspacesModule,
  ],
  providers: [
    ProjectsService,
    {
      provide: ProjectRepository,
      useClass: ProjectRepositoryAdapter,
    },
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
