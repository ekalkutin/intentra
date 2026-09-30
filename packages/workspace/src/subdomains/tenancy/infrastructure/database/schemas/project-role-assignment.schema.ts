import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ collection: 'project_role_assignments' })
export class ProjectRoleAssignmentModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true, index: true })
  readonly workspaceId: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly projectId: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true, index: true })
  readonly memberId: Types.UUID;

  @Prop({ type: String, required: true })
  readonly role: string;
}

export const ProjectRoleAssignmentSchema = SchemaFactory.createForClass(
  ProjectRoleAssignmentModel,
);

/** A Member holds at most one Project Role per Project. */
ProjectRoleAssignmentSchema.index(
  { projectId: 1, memberId: 1 },
  { unique: true },
);
