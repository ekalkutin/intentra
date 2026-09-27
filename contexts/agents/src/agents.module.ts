import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AgentsApi } from '@intentra/contracts/agents';

import { AgentsApiService } from './agents-api.service.js';
import { ConfigurableModuleClass } from './agents.module-definition.js';
import {
  AgentProfileRepository,
  ToolCatalog,
} from './application/ports/index.js';
import { AgentProfilesService } from './application/services/index.js';
import { CQRS_HANDLERS } from './application/use-cases/index.js';
import {
  AgentProfileRepositoryAdapter,
  ToolCatalogAdapter,
} from './infrastructure/adapters/index.js';
import {
  AgentProfileModel,
  AgentProfileSchema,
} from './infrastructure/database/index.js';

@Module({
  imports: [
    CqrsModule,
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
    ...CQRS_HANDLERS,
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
