import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { AgentsApi } from '@intentra/contracts/agents';

import { AgentsApiService } from './agents-api.service.js';
import { ConfigurableModuleClass } from './agents.module-definition.js';
import {
  AgentProfileRepository,
  AgentRuntime,
  ModelCatalog,
  OpenRouterKeyRepository,
  SecretCipher,
  ToolCatalog,
} from './application/ports/index.js';
import {
  AgentProfilesService,
  AgentToolsService,
  ChatService,
  ModelsService,
  OpenRouterKeysService,
} from './application/services/index.js';
import { CQRS_HANDLERS } from './application/use-cases/index.js';
import {
  AgentProfileRepositoryAdapter,
  MastraAgentRuntimeAdapter,
  OpenRouterKeyRepositoryAdapter,
  OpenRouterModelCatalogAdapter,
  SecretCipherAdapter,
  ToolCatalogAdapter,
} from './infrastructure/adapters/index.js';
import {
  AgentProfileModel,
  AgentProfileSchema,
  OpenRouterKeyModel,
  OpenRouterKeySchema,
} from './infrastructure/database/index.js';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: AgentProfileModel.name,
        schema: AgentProfileSchema,
      },
      {
        name: OpenRouterKeyModel.name,
        schema: OpenRouterKeySchema,
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
    OpenRouterKeysService,
    ModelsService,
    AgentToolsService,
    ChatService,
    {
      provide: AgentProfileRepository,
      useClass: AgentProfileRepositoryAdapter,
    },
    {
      provide: OpenRouterKeyRepository,
      useClass: OpenRouterKeyRepositoryAdapter,
    },
    {
      provide: SecretCipher,
      useClass: SecretCipherAdapter,
    },
    {
      provide: ModelCatalog,
      useClass: OpenRouterModelCatalogAdapter,
    },
    {
      provide: ToolCatalog,
      useClass: ToolCatalogAdapter,
    },
    {
      provide: AgentRuntime,
      useClass: MastraAgentRuntimeAdapter,
    },
  ],
  exports: [AgentsApi],
})
export class AgentsModule extends ConfigurableModuleClass {}
