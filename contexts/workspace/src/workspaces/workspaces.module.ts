import { Module } from '@nestjs/common';

import { WorkspaceRepository } from './application/workspace-repository.port.js';
import { WorkspacesService } from './application/workspaces.service.js';
import { WorkspaceRepositoryAdapter } from './infrastructure/workspace-repository.adapter.js';

@Module({
  providers: [
    WorkspacesService,
    {
      provide: WorkspaceRepository,
      useClass: WorkspaceRepositoryAdapter,
    },
  ],
  // `WorkspaceRepository` is exported for the projects module, which checks
  // that a workspace exists before it creates a project in it.
  exports: [WorkspacesService, WorkspaceRepository],
})
export class WorkspacesModule {}
