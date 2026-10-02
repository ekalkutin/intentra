import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import type { AnalysisSchedule } from '../../../domain/entities/index.js';

export type AnalysisScheduleQueryProps = {
  readonly projectId?: ProjectId;
  readonly enabled?: boolean;
};

export abstract class AnalysisScheduleRepository {
  abstract save(schedule: AnalysisSchedule): Promise<void>;
  /** Null for a Project whose schedule was never turned on. */
  abstract findOne(
    props: AnalysisScheduleQueryProps,
  ): Promise<AnalysisSchedule | null>;
  abstract findMany(
    props: AnalysisScheduleQueryProps,
  ): Promise<AnalysisSchedule[]>;
  abstract deleteMany(
    props:
      { readonly workspaceId: WorkspaceId } | { readonly projectId: ProjectId },
  ): Promise<void>;
}
