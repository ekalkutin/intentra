import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
  name: string;

  @Prop({ type: String, required: true })
  instructions: string;

  @Prop({ type: String, required: true })
  modelProvider: string;

  @Prop({ type: String, required: true })
  modelName: string;

  @Prop({ type: [String], required: true })
  tools: string[];

  @Prop({ type: Date, default: null })
  archivedAt: Date | null;
}

export const AgentProfileSchema =
  SchemaFactory.createForClass(AgentProfileModel);
