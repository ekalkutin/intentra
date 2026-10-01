import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

/**
 * IAM's Accounts, read for their names only and never written: a Member
 * shows its Account's current name (CONTEXT-MAP.md, IAM → all contexts).
 * Must follow IAM's `accounts` collection.
 */
@Schema({ collection: 'accounts' })
export class AccountNameModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: String, required: true })
  readonly name: string;
}

export const AccountNameSchema = SchemaFactory.createForClass(AccountNameModel);
