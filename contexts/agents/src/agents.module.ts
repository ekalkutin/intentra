import { Module } from '@nestjs/common';

import { AgentsApi } from '@intentra/contracts/agents';

import { AgentsApiService } from './agents-api.service.js';
import { ConfigurableModuleClass } from './agents.module-definition.js';
import { ProfilesModule } from './profiles/index.js';

@Module({
  imports: [ProfilesModule],
  providers: [
    {
      provide: AgentsApi,
      useClass: AgentsApiService,
    },
  ],
  exports: [AgentsApi],
})
export class AgentsModule extends ConfigurableModuleClass {}
