import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ collection: 'members' })
export class MemberModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly workspaceId: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true, index: true })
  readonly accountId: Types.UUID;

  @Prop({ type: String, required: true })
  readonly email: string;

  @Prop({ type: String, default: null })
  readonly role: string | null;

  @Prop({ type: String, required: true })
  readonly status: string;
}

export const MemberSchema = SchemaFactory.createForClass(MemberModel);

/** An Account is at most one Member of a Workspace. */
MemberSchema.index({ workspaceId: 1, accountId: 1 }, { unique: true });
MemberSchema.index({ workspaceId: 1, email: 1 });
