import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import {
  createWorkspaceDatabase,
  WorkspaceDatabase,
} from './infrastructure/database/workspace-database.js';
import { ProjectsModule } from './projects/index.js';
import { WorkspaceApiService } from './workspace-api.service.js';
import {
  ConfigurableModuleClass,
  WORKSPACE_OPTIONS,
  type WorkspaceModuleOptions,
} from './workspace.module-definition.js';
import { WorkspacesModule } from './workspaces/index.js';

@Module({
  imports: [WorkspacesModule, ProjectsModule],
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
  ],
  exports: [WorkspaceApi, WorkspaceDatabase],
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
