import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { AgentRole } from '../../domain/value-objects/index.js';

export type AgentProfileDocument = HydratedDocument<AgentProfileModel>;

@Schema({
  collection: 'agent_profiles',
})
export class AgentProfileModel {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true, index: true })
  workspaceId: string;

  @Prop({ type: String, required: true })
  role: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  instructions: string;

  @Prop({ type: String, required: true })
  model: string;

  @Prop({ type: [String], required: true })
  tools: string[];

  @Prop({ type: Date, default: null })
  archivedAt: Date | null;
}

export const AgentProfileSchema =
  SchemaFactory.createForClass(AgentProfileModel);

/** One orchestrator per workspace, even when two requests make it at once. */
AgentProfileSchema.index(
  { workspaceId: 1, role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: AgentRole.ORCHESTRATOR.value },
  },
);
