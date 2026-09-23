import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WorkspaceDocument = HydratedDocument<WorkspaceModel>;

@Schema({
  collection: 'workspaces',
})
export class WorkspaceModel {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  name: string;
}

export const WorkspaceSchema = SchemaFactory.createForClass(WorkspaceModel);
