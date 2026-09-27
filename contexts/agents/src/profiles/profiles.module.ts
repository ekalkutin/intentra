import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AgentProfileRepository } from './application/ports/agent-profile-repository.port.js';
import { ToolCatalog } from './application/ports/tool-catalog.port.js';
import { AgentProfilesService } from './application/services/agent-profiles.service.js';
import { AgentProfileRepositoryAdapter } from './infrastructure/agent-profile-repository.adapter.js';
import {
  AgentProfileModel,
  AgentProfileSchema,
} from './infrastructure/agent-profile.schema.js';
import { ToolCatalogAdapter } from './infrastructure/tool-catalog.adapter.js';

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
  exports: [AgentProfilesService, AgentProfileRepository],
})
export class ProfilesModule {}
