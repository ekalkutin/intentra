import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { AnalysisRun } from '../../../domain/entities/index.js';
import type {
  AnalysisRunId,
  AnalysisRunStatus,
} from '../../../domain/value-objects/index.js';
import { AnalysisRunNotFoundException } from '../../exceptions/index.js';

export type AnalysisRunQueryProps = {
  readonly id?: AnalysisRunId;
  readonly projectId?: ProjectId;
  readonly status?: AnalysisRunStatus;
};

export type AnalysisRunPage = {
  readonly take: number;
  readonly offset: number;
};

export abstract class AnalysisRunRepository {
  /** Refuses a second running Analysis Run in a Project (`AnalysisRunBusyException`). */
  abstract save(run: AnalysisRun): Promise<void>;
  abstract findOne(props: AnalysisRunQueryProps): Promise<AnalysisRun | null>;
  /** The newest first. */
  abstract findMany(
    props: AnalysisRunQueryProps,
    page?: AnalysisRunPage,
  ): Promise<AnalysisRun[]>;
  abstract count(props: AnalysisRunQueryProps): Promise<number>;
  abstract deleteMany(
    props:
      { readonly workspaceId: WorkspaceId } | { readonly projectId: ProjectId },
  ): Promise<void>;

  public async getOne(props: AnalysisRunQueryProps): Promise<AnalysisRun> {
    const run = await this.findOne(props);
    if (!run) {
      throw new AnalysisRunNotFoundException();
    }

    return run;
  }
}
