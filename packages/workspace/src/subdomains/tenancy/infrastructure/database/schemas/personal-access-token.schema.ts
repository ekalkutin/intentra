import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ collection: 'personal_access_tokens' })
export class PersonalAccessTokenModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true, index: true })
  readonly workspaceId: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true, index: true })
  readonly memberId: Types.UUID;

  @Prop({ type: String, required: true })
  readonly name: string;

  @Prop({ type: String, required: true })
  readonly level: string;

  @Prop({ type: String, required: true, unique: true })
  readonly secretHash: string;

  @Prop({ type: String, required: true })
  readonly secretHint: string;

  @Prop({ type: Date, required: true })
  readonly createdAt: Date;

  @Prop({ type: Date, default: null })
  readonly expiresAt: Date | null;

  @Prop({ type: Date, default: null })
  readonly lastUsedAt: Date | null;
}

export const PersonalAccessTokenSchema = SchemaFactory.createForClass(
  PersonalAccessTokenModel,
);
