import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'projects' })
export class ProjectModel {
  @Prop({ type: String, required: true })
  readonly _id: string;

  @Prop({ type: String, required: true })
  readonly workspaceId: string;

  @Prop({ type: String, required: true })
  readonly name: string;

  @Prop({ type: String, required: true })
  readonly slug: string;

  @Prop({ type: String, required: true })
  readonly createdBy: string;
}

export const ProjectSchema = SchemaFactory.createForClass(ProjectModel);

ProjectSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });
