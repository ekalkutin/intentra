import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ collection: 'invitations' })
export class InvitationModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly workspaceId: Types.UUID;

  @Prop({ type: String, required: true })
  readonly email: string;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly invitedBy: Types.UUID;

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
