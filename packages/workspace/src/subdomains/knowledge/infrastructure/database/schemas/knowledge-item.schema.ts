import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TermFieldsDocument = {
  readonly definition: string;
  readonly sort: string | null;
  readonly synonymsToAvoid: string[];
};

export type RequirementFieldsDocument = {
  readonly statement: string;
  readonly type: string | null;
  readonly priority: string | null;
  readonly acceptanceCriteria: string[];
};

export type DecisionFieldsDocument = {
  readonly decision: string;
  readonly area: string | null;
  readonly context: string | null;
  readonly rejectedAlternatives: {
    readonly alternative: string;
    readonly reason: string | null;
  }[];
};

@Schema({ collection: 'knowledge_items' })
export class KnowledgeItemModel {
  @Prop({ type: String, required: true })
  readonly _id: string;

  @Prop({ type: String, required: true, index: true })
  readonly workspaceId: string;

  @Prop({ type: String, required: true })
  readonly projectId: string;

  @Prop({ type: String, required: true })
  readonly kind: string;

  /** The Knowledge Key's number, counted per Kind within the Project. */
  @Prop({ type: Number, required: true })
  readonly number: number;

  @Prop({ type: String, required: true })
  readonly title: string;

  @Prop({ type: String, required: true })
  readonly status: string;

  @Prop({ type: String, required: true })
  readonly source: string;

  @Prop({ type: String, default: null })
  readonly rationale: string | null;

  /** The fields of the Kind, shaped by `kind`. */
  @Prop({ type: Object, required: true })
  readonly fields:
    TermFieldsDocument | RequirementFieldsDocument | DecisionFieldsDocument;

  @Prop({ type: String, required: true })
  readonly authorId: string;

  @Prop({ type: Date, required: true })
  readonly recordedAt: Date;

  @Prop({ type: String, default: null })
  readonly lastEditedBy: string | null;

  @Prop({ type: Date, default: null })
  readonly lastEditedAt: Date | null;
}

export const KnowledgeItemSchema =
  SchemaFactory.createForClass(KnowledgeItemModel);

/** A Knowledge Key names one Knowledge Item within its Project; also serves the listing's sort. */
KnowledgeItemSchema.index(
  { projectId: 1, kind: 1, number: 1 },
  { unique: true },
);
