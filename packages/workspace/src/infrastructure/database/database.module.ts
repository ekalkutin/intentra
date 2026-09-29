import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  InvitationModel,
  InvitationSchema,
  MemberModel,
  MemberSchema,
  ProjectModel,
  ProjectRoleAssignmentModel,
  ProjectRoleAssignmentSchema,
  ProjectSchema,
  WorkspaceModel,
  WorkspaceSchema,
} from './schemas/index.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkspaceModel.name, schema: WorkspaceSchema },
      { name: MemberModel.name, schema: MemberSchema },
      { name: ProjectModel.name, schema: ProjectSchema },
      { name: InvitationModel.name, schema: InvitationSchema },
      {
        name: ProjectRoleAssignmentModel.name,
        schema: ProjectRoleAssignmentSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
