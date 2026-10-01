import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

import type { AgentsContentDocument } from './agents-content.document.js';

/** Holds a single document: the one Unpublished Agents. */
@Schema({ collection: 'unpublished_agents' })
export class UnpublishedAgentsModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: Object, required: true })
  readonly content: AgentsContentDocument;
}

export const UnpublishedAgentsSchema = SchemaFactory.createForClass(
  UnpublishedAgentsModel,
);
