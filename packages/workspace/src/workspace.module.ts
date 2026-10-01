import { Module } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

import { CleanupAdapter } from './cleanup.adapter.js';
import {
  AGENTS_OPTIONS,
  AGENTS_PROVIDERS,
  AgentsDatabaseModule,
  DEFAULT_AGENTS_OPTIONS,
  type AgentsOptions,
} from './subdomains/agents/index.js';
import {
  KNOWLEDGE_PROVIDERS,
  KnowledgeDatabaseModule,
} from './subdomains/knowledge/index.js';
import {
  Cleanup,
  TENANCY_PROVIDERS,
  TenancyDatabaseModule,
} from './subdomains/tenancy/index.js';
import { WorkspaceApiService } from './workspace-api.service.js';
import {
  ConfigurableModuleClass,
  WORKSPACE_OPTIONS,
  type WorkspaceModuleOptions,
} from './workspace.module-defs.js';

/** One context, one database: every subdomain is wired here (docs/adr/0001-knowledge-and-agents-are-subdomains-of-workspace.md). */
@Module({
  imports: [
    TenancyDatabaseModule,
    KnowledgeDatabaseModule,
    AgentsDatabaseModule,
  ],
  providers: [
    ...TENANCY_PROVIDERS,
    ...KNOWLEDGE_PROVIDERS,
    ...AGENTS_PROVIDERS,
    {
      provide: AGENTS_OPTIONS,
      inject: [WORKSPACE_OPTIONS],
      useFactory: ({ agents }: WorkspaceModuleOptions): AgentsOptions => ({
        ...DEFAULT_AGENTS_OPTIONS,
        ...agents,
      }),
    },
    WorkspaceApiService,
    { provide: WorkspaceApi, useExisting: WorkspaceApiService },
    { provide: Cleanup, useClass: CleanupAdapter },
  ],
  exports: [WorkspaceApi],
})
export class WorkspaceModule extends ConfigurableModuleClass {}
