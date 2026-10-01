import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProviderKeyModel, ProviderKeySchema } from './schemas/index.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProviderKeyModel.name, schema: ProviderKeySchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
