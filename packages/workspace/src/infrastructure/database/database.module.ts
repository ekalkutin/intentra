import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  MemberModel,
  MemberSchema,
  WorkspaceModel,
  WorkspaceSchema,
} from './schemas/index.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkspaceModel.name, schema: WorkspaceSchema },
      { name: MemberModel.name, schema: MemberSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
