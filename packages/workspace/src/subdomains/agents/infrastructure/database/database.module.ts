import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AgentsVersionModel,
  AgentsVersionSchema,
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
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
