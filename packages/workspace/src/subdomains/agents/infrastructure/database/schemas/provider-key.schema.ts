import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ collection: 'provider_keys' })
export class ProviderKeyModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  /** At most one key per Workspace. */
  @Prop({ type: SchemaTypes.UUID, required: true, unique: true })
  readonly workspaceId: Types.UUID;

  @Prop({ type: String, required: true })
  readonly encryptedKey: string;

  @Prop({ type: String, required: true })
  readonly hint: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly addedBy: Types.UUID;

  @Prop({ type: Date, required: true })
  readonly addedAt: Date;
}

export const ProviderKeySchema = SchemaFactory.createForClass(ProviderKeyModel);
