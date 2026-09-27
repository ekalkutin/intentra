import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PersonalAccessTokenDocument =
  HydratedDocument<PersonalAccessTokenModel>;

@Schema({
  collection: 'personal_access_tokens',
})
export class PersonalAccessTokenModel {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true, index: true })
  accountId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  secretHash: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;

  @Prop({ type: Date, default: null })
  expiresAt: Date | null;

  @Prop({ type: Date, default: null })
  revokedAt: Date | null;
}

export const PersonalAccessTokenSchema = SchemaFactory.createForClass(
  PersonalAccessTokenModel,
);
