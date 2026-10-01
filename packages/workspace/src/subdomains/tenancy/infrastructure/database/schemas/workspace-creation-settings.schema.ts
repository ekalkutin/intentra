import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** Holds a single document: the Open Workspace Creation setting. */
@Schema({ collection: 'workspace_creation_settings' })
export class WorkspaceCreationSettingsModel {
  @Prop({ type: String, required: true })
  readonly _id: string;

  @Prop({ type: Boolean, required: true })
  readonly open: boolean;
}

export const WorkspaceCreationSettingsSchema = SchemaFactory.createForClass(
  WorkspaceCreationSettingsModel,
);
