import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'workspaces' })
export class WorkspaceModel {
  @Prop({ type: String, required: true })
  readonly _id: string;

  @Prop({ type: String, required: true })
  readonly name: string;

  @Prop({ type: String, required: true, unique: true })
  readonly slug: string;

  /** Bumped by `WorkspaceRepository.lock`; carries no meaning of its own. */
  @Prop({ type: Number, default: 0 })
  readonly lockVersion: number;
}

export const WorkspaceSchema = SchemaFactory.createForClass(WorkspaceModel);
