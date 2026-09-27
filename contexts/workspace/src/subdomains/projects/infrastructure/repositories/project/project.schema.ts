import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProjectDocument = HydratedDocument<ProjectModel>;

@Schema({
  collection: 'projects',
})
export class ProjectModel {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  workspaceId: string;

  @Prop()
  name: string;

  @Prop({ type: String, required: false })
  description: string;
}

export const ProjectSchema = SchemaFactory.createForClass(ProjectModel);
