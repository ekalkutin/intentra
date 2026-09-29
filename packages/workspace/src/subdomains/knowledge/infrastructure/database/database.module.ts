import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  KnowledgeItemModel,
  KnowledgeItemSchema,
  KnowledgeKeyCounterModel,
  KnowledgeKeyCounterSchema,
} from './schemas/index.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeItemModel.name, schema: KnowledgeItemSchema },
      {
        name: KnowledgeKeyCounterModel.name,
        schema: KnowledgeKeyCounterSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
