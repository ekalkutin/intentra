import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'workspaces' })
export class WorkspaceModel {
  @Prop({ type: String, required: true })
  readonly _id: string;

  @Prop({ type: String, required: true })
  readonly name: string;

  @Prop({ type: String, required: true, unique: true })
  readonly slug: string;

  @Prop({ type: String, required: true })
  readonly ownerId: string;
}

export const WorkspaceSchema = SchemaFactory.createForClass(WorkspaceModel);
