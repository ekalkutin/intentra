import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** The last Knowledge Key number handed out for one Kind in one Project. */
@Schema({ collection: 'knowledge_key_counters' })
export class KnowledgeKeyCounterModel {
  @Prop({ type: String, required: true, index: true })
  readonly workspaceId: string;

  @Prop({ type: String, required: true })
  readonly projectId: string;

  @Prop({ type: String, required: true })
  readonly kind: string;

  @Prop({ type: Number, required: true })
  readonly lastNumber: number;
}

export const KnowledgeKeyCounterSchema = SchemaFactory.createForClass(
  KnowledgeKeyCounterModel,
);

KnowledgeKeyCounterSchema.index({ projectId: 1, kind: 1 }, { unique: true });
