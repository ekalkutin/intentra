import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ collection: 'analysis_schedules' })
export class AnalysisScheduleModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly workspaceId: Types.UUID;

  /** One schedule per Project. */
  @Prop({ type: SchemaTypes.UUID, required: true, unique: true })
  readonly projectId: Types.UUID;

  @Prop({ type: Boolean, required: true })
  readonly enabled: boolean;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly changedBy: Types.UUID;

  @Prop({ type: Date, required: true })
  readonly changedAt: Date;
}

export const AnalysisScheduleSchema = SchemaFactory.createForClass(
  AnalysisScheduleModel,
);

AnalysisScheduleSchema.index({ enabled: 1 });
