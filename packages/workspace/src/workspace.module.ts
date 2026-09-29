import { Module } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import { CleanupAdapter } from './cleanup.adapter.js';
import {
  Cleanup,
  TENANCY_PROVIDERS,
  TenancyDatabaseModule,
} from './subdomains/tenancy/index.js';
import { WorkspaceApiService } from './workspace-api.service.js';
import { ConfigurableModuleClass } from './workspace.module-defs.js';

/** One context, one database: every subdomain is wired here (docs/adr/0001-knowledge-and-agents-are-subdomains-of-workspace.md). */
@Module({
  imports: [TenancyDatabaseModule],
  providers: [
    ...TENANCY_PROVIDERS,
    WorkspaceApiService,
    { provide: WorkspaceApi, useExisting: WorkspaceApiService },
    { provide: Cleanup, useClass: CleanupAdapter },
  ],
  exports: [WorkspaceApi],
})
export class WorkspaceModule extends ConfigurableModuleClass {}
