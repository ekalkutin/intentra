import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'personal_access_tokens' })
export class PersonalAccessTokenModel {
  @Prop({ type: String, required: true })
  readonly _id: string;

  @Prop({ type: String, required: true, index: true })
  readonly workspaceId: string;

  @Prop({ type: String, required: true, index: true })
  readonly memberId: string;

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
