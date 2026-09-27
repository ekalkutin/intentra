import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';

import { AgentsApi } from '@intentra/contracts/agents';

import { AgentsApiService } from './agents-api.service.js';
import {
  AGENTS_OPTIONS,
  ConfigurableModuleClass,
  type AgentsModuleOptions,
} from './agents.module-definition.js';
import { AgentProfileRepository } from './application/ports/agent-profile-repository.port.js';
import { ToolCatalog } from './application/ports/tool-catalog.port.js';
import { AgentProfilesService } from './application/services/agent-profiles.service.js';
import { AgentProfileRepositoryAdapter } from './infrastructure/adapters/agent-profile-repository.adapter.js';
import { ToolCatalogAdapter } from './infrastructure/adapters/tool-catalog.adapter.js';
import {
  AgentsDatabase,
  createAgentsDatabase,
} from './infrastructure/database/agents-database.js';

@Module({
  providers: [
    {
      provide: AgentsApi,
      useClass: AgentsApiService,
    },
    {
      provide: AgentsDatabase,
      useFactory: (options: AgentsModuleOptions) =>
        createAgentsDatabase(options.database.url),
      inject: [AGENTS_OPTIONS],
    },
    AgentProfilesService,
    {
      provide: AgentProfileRepository,
      useClass: AgentProfileRepositoryAdapter,
    },
    {
      provide: ToolCatalog,
      useClass: ToolCatalogAdapter,
    },
  ],
  exports: [AgentsApi],
})
export class AgentsModule
  extends ConfigurableModuleClass
  implements OnApplicationShutdown
{
  constructor(
    @Inject(AgentsDatabase)
    private readonly database: AgentsDatabase,
  ) {
    super();
  }

  public async onApplicationShutdown(): Promise<void> {
    await this.database.close();
  }
}
