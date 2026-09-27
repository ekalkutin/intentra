import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AgentProfileRepository } from './application/ports/agent-profile-repository.port.js';
import { AgentProfileRepositoryAdapter } from './infrastructure/agent-profile-repository.adapter.js';
import {
  AgentProfileModel,
  AgentProfileSchema,
} from './infrastructure/agent-profile.schema.js';

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
      provide: AgentProfileRepository,
      useClass: AgentProfileRepositoryAdapter,
    },
  ],
  exports: [AgentProfileRepository],
})
export class ProfilesModule {}
