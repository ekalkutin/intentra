import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ collection: 'analysis_runs' })
export class AnalysisRunModel {
  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly _id: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly workspaceId: Types.UUID;

  @Prop({ type: SchemaTypes.UUID, required: true })
  readonly projectId: Types.UUID;

  @Prop({ type: String, required: true })
  readonly scope: string;

  /** 0 for a run from before runs went item by item. */
  @Prop({ type: Number, default: 0 })
  readonly itemCount: number;

  @Prop({ type: Number, default: 0 })
  readonly checkedCount: number;

  /** Null for a run the schedule started. */
  @Prop({ type: SchemaTypes.UUID, default: null })
  readonly startedBy: Types.UUID | null;

  @Prop({ type: Date, required: true })
  readonly startedAt: Date;

  @Prop({ type: Number, default: null })
  readonly agentsVersion: number | null;

  @Prop({ type: String, required: true })
  readonly status: string;

  @Prop({ type: Date, default: null })
  readonly finishedAt: Date | null;

  @Prop({ type: [String], default: [] })
  readonly questionKeys: string[];

  @Prop({ type: Boolean, default: false })
  readonly stepLimitReached: boolean;

  @Prop({ type: String, default: null })
  readonly failure: string | null;
}

export const AnalysisRunSchema = SchemaFactory.createForClass(AnalysisRunModel);

AnalysisRunSchema.index({ projectId: 1, startedAt: -1 });
// At most one running Analysis Run per Project, whatever API instance starts it.
AnalysisRunSchema.index(
  { projectId: 1 },
  { unique: true, partialFilterExpression: { status: 'running' } },
);
