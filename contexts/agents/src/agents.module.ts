import { Inject, Module, type OnApplicationShutdown } from '@nestjs/common';

import { AgentsApi } from '@intentra/contracts/agents';

import { AgentsApiService } from './agents-api.service.js';
import {
  AGENTS_OPTIONS,
  ConfigurableModuleClass,
  type AgentsModuleOptions,
} from './agents.module-definition.js';
import {
  AgentsDatabase,
  createAgentsDatabase,
} from './infrastructure/database/agents-database.js';
import { ProfilesModule } from './profiles/index.js';

@Module({
  imports: [ProfilesModule],
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
  ],
  exports: [AgentsApi, AgentsDatabase],
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
