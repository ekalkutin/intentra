import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

import type { AgentsContentDocument } from './agents-content.document.js';

@Schema({ collection: 'agents_versions' })
export class AgentsVersionModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: Number, required: true, unique: true })
  readonly number: number;

  @Prop({ type: Object, required: true })
  readonly content: AgentsContentDocument;

  @Prop({ type: String, default: null })
  readonly note: string | null;

  @Prop({ type: SchemaTypes.UUID, default: null })
  readonly publisherAccountId: Types.UUID | null;

  @Prop({ type: String, default: null })
  readonly publisherEmail: string | null;

  @Prop({ type: Date, required: true })
  readonly publishedAt: Date;
}

export const AgentsVersionSchema =
  SchemaFactory.createForClass(AgentsVersionModel);
