import type { Actor } from '../../iam/index.js';

import type {
  AnalysisRunDto,
  AnalysisRunPageDto,
  AnalysisScheduleDto,
  ChangeAnalysisScheduleDto,
  ListAnalysisRunsDto,
  StartAnalysisRunDto,
} from './analysis-run.dto.js';

/**
 * A Project's Analysis Runs: the Auditor looking over its knowledge item by
 * item, as Intentra, and recording what it finds as Open Questions. Every
 * Member reads them; a Contributor or Maintainer starts one over the
 * Unchecked items, only a Maintainer one over the whole Project (403
 * `ANALYSIS_RUN_FORBIDDEN` otherwise).
 */
export abstract class AnalysisRunsApi {
  /**
   * Starts a run and answers at once, the run still running; it goes on in
   * the background, and its result is read with `get`. One at a time in a
   * Project (409 `ANALYSIS_RUN_BUSY`). Without a Provider Key or Published
   * Agents it is kept as failed.
   */
  abstract start(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    data: StartAnalysisRunDto,
  ): Promise<AnalysisRunDto>;

  /** The newest first. */
  abstract list(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    query: ListAnalysisRunsDto,
  ): Promise<AnalysisRunPageDto>;

  /** 404 `ANALYSIS_RUN_NOT_FOUND` for one of another Project. */
  abstract get(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    runId: string,
  ): Promise<AnalysisRunDto>;

  /** The Project's nightly run. Every Member reads it. */
  abstract schedule(
    actor: Actor,
    workspaceId: string,
    projectId: string,
  ): Promise<AnalysisScheduleDto>;

  /** Turns the nightly run on or off; a Maintainer only (403 `ANALYSIS_SCHEDULE_FORBIDDEN`). */
  abstract changeSchedule(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    data: ChangeAnalysisScheduleDto,
  ): Promise<AnalysisScheduleDto>;
}
