import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

import {
  KnowledgeKind,
  KnowledgeStatus,
  type KnowledgeFields,
  type KnowledgeLinkProps,
} from '../../../domain/value-objects/index.js';

@Schema({ collection: 'knowledge_items' })
export class KnowledgeItemModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true, index: true })
  readonly workspaceId: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly projectId: Types.UUID;

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

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly authorId: Types.UUID;

  @Prop({ type: Date, required: true })
  readonly recordedAt: Date;

  @Prop({ type: SchemaTypes.UUID, default: null })
  readonly lastEditedBy: Types.UUID | null;

  @Prop({ type: Date, default: null })
  readonly lastEditedAt: Date | null;

  @Prop({ type: SchemaTypes.UUID, default: null })
  readonly approvedBy: Types.UUID | null;

  @Prop({ type: Date, default: null })
  readonly approvedAt: Date | null;

  @Prop({ type: SchemaTypes.UUID, default: null })
  readonly rejectedBy: Types.UUID | null;

  @Prop({ type: Date, default: null })
  readonly rejectedAt: Date | null;

  @Prop({ type: String, default: null })
  readonly rejectionReason: string | null;

  /** The Knowledge Key of the item it replaces once approved. */
  @Prop({ type: String, default: null })
  readonly supersedes: string | null;

  @Prop({ type: SchemaTypes.UUID, default: null })
  readonly supersededBy: Types.UUID | null;

  @Prop({ type: Date, default: null })
  readonly supersededAt: Date | null;

  @Prop({ type: String, default: null })
  readonly supersededByKey: string | null;

  @Prop({ type: SchemaTypes.UUID, default: null })
  readonly retiredBy: Types.UUID | null;

  @Prop({ type: Date, default: null })
  readonly retiredAt: Date | null;

  @Prop({ type: String, default: null })
  readonly retirementReason: string | null;

  @Prop({
    type: [{ _id: false, type: { type: String }, key: { type: String } }],
    default: [],
  })
  readonly links: KnowledgeLinkProps[];

  /** The Knowledge Keys of the targets whose change marked it Needs Review. */
  @Prop({ type: [String], default: [] })
  readonly reviewCauses: string[];

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

/** Finds the items linking to one, to mark them or to keep it from being deleted. */
KnowledgeItemSchema.index({ projectId: 1, 'links.key': 1 });

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
