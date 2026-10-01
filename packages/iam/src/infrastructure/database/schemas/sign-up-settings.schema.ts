import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

/** Holds a single document: the Open Sign-up setting. */
@Schema({ collection: 'sign_up_settings' })
export class SignUpSettingsModel {
  @Prop({ type: String, required: true })
  readonly _id: string;

  @Prop({ type: Boolean, required: true })
  readonly open: boolean;
}

export const SignUpSettingsSchema =
  SchemaFactory.createForClass(SignUpSettingsModel);
