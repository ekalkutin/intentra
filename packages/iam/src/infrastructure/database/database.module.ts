import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountModel, AccountSchema } from './schemas/account.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountModel.name, schema: AccountSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
