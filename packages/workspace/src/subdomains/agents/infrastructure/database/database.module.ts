import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AgentsVersionModel,
  AgentsVersionSchema,
  AnalysisRunModel,
  AnalysisRunSchema,
  AnalysisScheduleModel,
  AnalysisScheduleSchema,
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
      { name: AnalysisScheduleModel.name, schema: AnalysisScheduleSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
