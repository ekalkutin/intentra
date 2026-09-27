import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import { ProjectRepository } from './application/ports/project-repository.port.js';
import { WorkspaceRepository } from './application/ports/workspace-repository.port.js';
import { ProjectsService } from './application/services/projects.service.js';
import { WorkspacesService } from './application/services/workspaces.service.js';
import { ProjectRepositoryAdapter } from './infrastructure/adapters/project-repository.adapter.js';
import { WorkspaceRepositoryAdapter } from './infrastructure/adapters/workspace-repository.adapter.js';
import {
  createWorkspaceDatabase,
  WorkspaceDatabase,
} from './infrastructure/database/workspace-database.js';
import { WorkspaceApiService } from './workspace-api.service.js';
import {
  ConfigurableModuleClass,
  WORKSPACE_OPTIONS,
  type WorkspaceModuleOptions,
} from './workspace.module-definition.js';

@Module({
  providers: [
    {
      provide: WorkspaceApi,
      useClass: WorkspaceApiService,
    },
    {
      provide: WorkspaceDatabase,
      useFactory: (options: WorkspaceModuleOptions) =>
        createWorkspaceDatabase(options.database.url),
      inject: [WORKSPACE_OPTIONS],
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
export class WorkspaceModule
  extends ConfigurableModuleClass
  implements OnApplicationShutdown
{
  constructor(
    @Inject(WorkspaceDatabase)
    private readonly database: WorkspaceDatabase,
  ) {
    super();
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.database.close();
  }
}
