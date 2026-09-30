import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ collection: 'projects' })
export class ProjectModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly workspaceId: Types.UUID;

  @Prop({ type: String, required: true })
  readonly name: string;

  @Prop({ type: String, required: true })
  readonly slug: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly createdBy: Types.UUID;
}

export const ProjectSchema = SchemaFactory.createForClass(ProjectModel);

ProjectSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });
