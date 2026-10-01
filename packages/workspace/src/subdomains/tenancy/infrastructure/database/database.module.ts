import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AccountNameModel,
  AccountNameSchema,
  InvitationModel,
  InvitationSchema,
  MemberModel,
  MemberSchema,
  PersonalAccessTokenModel,
  PersonalAccessTokenSchema,
  ProjectModel,
  ProjectRoleAssignmentModel,
  ProjectRoleAssignmentSchema,
  ProjectSchema,
  WorkspaceCreationSettingsModel,
  WorkspaceCreationSettingsSchema,
  WorkspaceModel,
  WorkspaceSchema,
} from './schemas/index.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkspaceModel.name, schema: WorkspaceSchema },
      { name: AccountNameModel.name, schema: AccountNameSchema },
      { name: MemberModel.name, schema: MemberSchema },
      { name: ProjectModel.name, schema: ProjectSchema },
      { name: InvitationModel.name, schema: InvitationSchema },
      {
        name: PersonalAccessTokenModel.name,
        schema: PersonalAccessTokenSchema,
      },
      {
        name: ProjectRoleAssignmentModel.name,
        schema: ProjectRoleAssignmentSchema,
      },
      {
        name: WorkspaceCreationSettingsModel.name,
        schema: WorkspaceCreationSettingsSchema,
      },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
