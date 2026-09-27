import { Module } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import { ProjectsModule } from './projects/index.js';
import { WorkspaceApiService } from './workspace-api.service.js';
import { ConfigurableModuleClass } from './workspace.module-definition.js';
import { WorkspacesModule } from './workspaces/index.js';

@Module({
  imports: [WorkspacesModule, ProjectsModule],
  providers: [
    {
      provide: WorkspaceApi,
      useClass: WorkspaceApiService,
    },
  ],
  exports: [WorkspaceApi],
})
export class WorkspaceModule extends ConfigurableModuleClass {}
