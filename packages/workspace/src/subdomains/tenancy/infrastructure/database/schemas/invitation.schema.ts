import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'invitations' })
export class InvitationModel {
  @Prop({ type: String, required: true })
  readonly _id: string;

  @Prop({ type: String, required: true })
  readonly workspaceId: string;

  @Prop({ type: String, required: true })
  readonly email: string;

  @Prop({ type: String, required: true })
  readonly invitedBy: string;

  @Prop({ type: Date, required: true })
  readonly sentAt: Date;

  @Prop({ type: Date, required: true })
  readonly expiresAt: Date;

  @Prop({ type: String, required: true })
  readonly status: string;
}

export const InvitationSchema = SchemaFactory.createForClass(InvitationModel);

InvitationSchema.index({ workspaceId: 1, sentAt: -1 });

InvitationSchema.index({ workspaceId: 1, email: 1 }, { unique: true });

/** Finds the Invitations waiting for an email. */
InvitationSchema.index({ email: 1, status: 1 });
