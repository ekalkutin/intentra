import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<AccountModel>;

@Schema({
  collection: 'accounts',
})
export class AccountModel {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: String, default: null })
  displayName: string | null;
}

export const AccountSchema = SchemaFactory.createForClass(AccountModel);
