import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'members' })
export class MemberModel {
  @Prop({ type: String, required: true })
  readonly _id: string;

  @Prop({ type: String, required: true })
  readonly workspaceId: string;

  @Prop({ type: String, required: true, index: true })
  readonly accountId: string;

  @Prop({ type: String, required: true })
  readonly email: string;

  @Prop({ type: String, required: true })
  readonly role: string;

  @Prop({ type: String, required: true })
  readonly status: string;
}

export const MemberSchema = SchemaFactory.createForClass(MemberModel);

/** An Account is at most one Member of a Workspace. */
MemberSchema.index({ workspaceId: 1, accountId: 1 }, { unique: true });
MemberSchema.index({ workspaceId: 1, email: 1 });
