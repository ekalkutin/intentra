import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AccountModel,
  AccountSchema,
  SignUpSettingsModel,
  SignUpSettingsSchema,
} from './schemas/index.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountModel.name, schema: AccountSchema },
      { name: SignUpSettingsModel.name, schema: SignUpSettingsSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
