import { Module } from '@nestjs/common';

import { WorkspacesModule } from '../workspaces/index.js';

import { ProjectRepository } from './application/project-repository.port.js';
import { ProjectsService } from './application/projects.service.js';
import { ProjectRepositoryAdapter } from './infrastructure/project-repository.adapter.js';

@Module({
  imports: [WorkspacesModule],
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
