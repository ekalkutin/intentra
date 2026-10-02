import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AgentsVersionModel,
  AgentsVersionSchema,
  AnalysisRunModel,
  AnalysisRunSchema,
  ProviderKeyModel,
  ProviderKeySchema,
  UnpublishedAgentsModel,
  UnpublishedAgentsSchema,
} from './schemas/index.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProviderKeyModel.name, schema: ProviderKeySchema },
      { name: UnpublishedAgentsModel.name, schema: UnpublishedAgentsSchema },
      { name: AgentsVersionModel.name, schema: AgentsVersionSchema },
      { name: AnalysisRunModel.name, schema: AnalysisRunSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
