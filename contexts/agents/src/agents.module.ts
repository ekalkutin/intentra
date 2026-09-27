import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AgentsApi } from '@intentra/contracts/agents';

import { AgentsApiService } from './agents-api.service.js';
import { ConfigurableModuleClass } from './agents.module-definition.js';
import { AgentProfileRepository } from './application/ports/agent-profile-repository.port.js';
import { ToolCatalog } from './application/ports/tool-catalog.port.js';
import { AgentProfilesService } from './application/services/agent-profiles.service.js';
import { AgentProfileRepositoryAdapter } from './infrastructure/adapters/agent-profile-repository.adapter.js';
import { ToolCatalogAdapter } from './infrastructure/adapters/tool-catalog.adapter.js';
import {
  AgentProfileModel,
  AgentProfileSchema,
} from './infrastructure/database/agent-profile.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: AgentProfileModel.name,
        schema: AgentProfileSchema,
      },
    ]),
  ],
  providers: [
    {
      provide: AgentsApi,
      useClass: AgentsApiService,
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
export class AgentsModule extends ConfigurableModuleClass {}
