import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

/** The last Knowledge Key number handed out for one Kind in one Project. */
@Schema({ collection: 'knowledge_key_counters' })
export class KnowledgeKeyCounterModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true, index: true })
  readonly workspaceId: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly projectId: Types.UUID;

  @Prop({ type: String, required: true })
  readonly kind: string;

  @Prop({ type: Number, required: true })
  readonly lastNumber: number;
}

export const KnowledgeKeyCounterSchema = SchemaFactory.createForClass(
  KnowledgeKeyCounterModel,
);

KnowledgeKeyCounterSchema.index({ projectId: 1, kind: 1 }, { unique: true });
