import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OpenRouterKeyDocument = HydratedDocument<OpenRouterKeyModel>;

@Schema({
  collection: 'open_router_keys',
})
export class OpenRouterKeyModel {
  /** The workspace id: one key per workspace. */
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  ciphertext: string;

  @Prop({ type: String, required: true })
  hint: string;

  @Prop({ type: Date, required: true })
  updatedAt: Date;
}

export const OpenRouterKeySchema =
  SchemaFactory.createForClass(OpenRouterKeyModel);
