import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'project_role_assignments' })
export class ProjectRoleAssignmentModel {
  @Prop({ type: String, required: true })
  readonly _id: string;

  @Prop({ type: String, required: true, index: true })
  readonly workspaceId: string;

  @Prop({ type: String, required: true })
  readonly projectId: string;

  @Prop({ type: String, required: true, index: true })
  readonly memberId: string;

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
