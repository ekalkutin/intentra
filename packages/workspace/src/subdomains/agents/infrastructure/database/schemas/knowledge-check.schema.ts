import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

/** When an Analysis Run last looked at one Knowledge Item, and at which version. */
@Schema({ collection: 'knowledge_checks' })
export class KnowledgeCheckModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly workspaceId: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly projectId: Types.UUID;

  /** The Knowledge Key, never reused within the Project. */
  @Prop({ type: String, required: true })
  readonly key: string;

  @Prop({ type: Number, required: true })
  readonly version: number;

  @Prop({ type: Date, required: true })
  readonly checkedAt: Date;
}

export const KnowledgeCheckSchema =
  SchemaFactory.createForClass(KnowledgeCheckModel);

KnowledgeCheckSchema.index({ projectId: 1, key: 1 }, { unique: true });
KnowledgeCheckSchema.index({ workspaceId: 1 });
