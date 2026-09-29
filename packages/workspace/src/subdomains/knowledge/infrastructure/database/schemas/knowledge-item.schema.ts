import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import {
  KnowledgeKind,
  KnowledgeStatus,
  type KnowledgeFields,
} from '../../../domain/value-objects/index.js';

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
  readonly fields: KnowledgeFields;

  @Prop({ type: String, required: true })
  readonly authorId: string;

  @Prop({ type: Date, required: true })
  readonly recordedAt: Date;

  @Prop({ type: String, default: null })
  readonly lastEditedBy: string | null;

  @Prop({ type: Date, default: null })
  readonly lastEditedAt: Date | null;

  @Prop({ type: String, default: null })
  readonly approvedBy: string | null;

  @Prop({ type: Date, default: null })
  readonly approvedAt: Date | null;

  @Prop({ type: String, default: null })
  readonly rejectedBy: string | null;

  @Prop({ type: Date, default: null })
  readonly rejectedAt: Date | null;

  @Prop({ type: String, default: null })
  readonly rejectionReason: string | null;

  /** The Knowledge Key of the item it replaces once approved. */
  @Prop({ type: String, default: null })
  readonly supersedes: string | null;

  @Prop({ type: String, default: null })
  readonly supersededBy: string | null;

  @Prop({ type: Date, default: null })
  readonly supersededAt: Date | null;

  @Prop({ type: String, default: null })
  readonly supersededByKey: string | null;

  @Prop({ type: String, default: null })
  readonly retiredBy: string | null;

  @Prop({ type: Date, default: null })
  readonly retiredAt: Date | null;

  @Prop({ type: String, default: null })
  readonly retirementReason: string | null;

  @Prop({ type: Number, required: true })
  readonly version: number;
}

export const KnowledgeItemSchema =
  SchemaFactory.createForClass(KnowledgeItemModel);

/** A Knowledge Key names one Knowledge Item within its Project; also serves the listing's sort. */
KnowledgeItemSchema.index(
  { projectId: 1, kind: 1, number: 1 },
  { unique: true },
);

/** A Project has one Approved Product Overview, even when two approvals race. */
KnowledgeItemSchema.index(
  { projectId: 1, kind: 1 },
  {
    unique: true,
    partialFilterExpression: {
      kind: KnowledgeKind.ProductOverview.value,
      status: KnowledgeStatus.Approved.value,
    },
  },
);
