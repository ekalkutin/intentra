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

  /** Account ids. */
  @Prop({ type: [String], required: true, index: true })
  members: string[];
}

export const WorkspaceSchema = SchemaFactory.createForClass(WorkspaceModel);
