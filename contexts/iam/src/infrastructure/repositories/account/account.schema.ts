import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<AccountModel>;

@Schema({
  collection: 'accounts',
})
export class AccountModel {
  // The domain generates ids (AccountId, UUID), so _id stores them as is
  // instead of a Mongo ObjectId.
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;
}

export const AccountSchema = SchemaFactory.createForClass(AccountModel);
