import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ collection: 'workspaces' })
export class WorkspaceModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: String, required: true })
  readonly name: string;

  @Prop({ type: String, required: true, unique: true })
  readonly slug: string;

  /** Bumped by `WorkspaceRepository.lock`; carries no meaning of its own. */
  @Prop({ type: Number, default: 0 })
  readonly lockVersion: number;
}

export const WorkspaceSchema = SchemaFactory.createForClass(WorkspaceModel);
