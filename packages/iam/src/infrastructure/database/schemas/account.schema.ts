import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types, type HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<AccountModel>;

@Schema({ collection: 'accounts' })
export class AccountModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: String, required: true, unique: true })
  readonly email: string;

  @Prop({ type: String, required: true })
  readonly passwordHash: string;

  @Prop({ type: Boolean, required: true, default: false })
  readonly isPlatformAdmin: boolean;
}

export const AccountSchema = SchemaFactory.createForClass(AccountModel);
