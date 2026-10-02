import { Aggregate, ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import { AnalysisScheduleId } from '../value-objects/index.js';

/**
 * Whether a Project is checked every night: an Analysis Run over what changed
 * since the last completed one. One per Project; a Maintainer turns it on or
 * off.
 */
export class AnalysisSchedule extends Aggregate<AnalysisScheduleId> {
  readonly #workspaceId: WorkspaceId;
  readonly #projectId: ProjectId;
  #enabled: boolean;
  #changedBy: MemberId;
  #changedAt: Temporal.Instant;

  private constructor(id: AnalysisScheduleId, state: AnalysisScheduleState) {
    super(id);
    this.#workspaceId = state.workspaceId;
    this.#projectId = state.projectId;
    this.#enabled = state.enabled;
    this.#changedBy = state.changedBy;
    this.#changedAt = state.changedAt;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get projectId(): ProjectId {
    return this.#projectId;
  }

  get enabled(): boolean {
    return this.#enabled;
  }

  /** The Member who last turned it on or off. */
  get changedBy(): MemberId {
    return this.#changedBy;
  }

  get changedAt(): Temporal.Instant {
    return this.#changedAt;
  }

  public static create(props: AnalysisScheduleCreateProps): AnalysisSchedule {
    return new AnalysisSchedule(new AnalysisScheduleId(), {
      workspaceId: new WorkspaceId(props.workspaceId),
      projectId: new ProjectId(props.projectId),
      enabled: props.enabled,
      changedBy: new MemberId(props.changedBy),
      changedAt: Temporal.Now.instant(),
    });
  }

  public static restore(props: AnalysisScheduleRestoreProps): AnalysisSchedule {
    return new AnalysisSchedule(new AnalysisScheduleId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      projectId: new ProjectId(props.projectId),
      enabled: props.enabled,
      changedBy: new MemberId(props.changedBy),
      changedAt: props.changedAt,
    });
  }

  /** Turning it to what it already is changes nothing, not even who did it. */
  public turn(enabled: boolean, by: MemberId): void {
    if (this.#enabled === enabled) {
      return;
    }
    this.#enabled = enabled;
    this.#changedBy = by;
    this.#changedAt = Temporal.Now.instant();
  }
}

type AnalysisScheduleState = {
  readonly workspaceId: WorkspaceId;
  readonly projectId: ProjectId;
  readonly enabled: boolean;
  readonly changedBy: MemberId;
  readonly changedAt: Temporal.Instant;
};

type AnalysisScheduleCreateProps = {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly enabled: boolean;
  readonly changedBy: string;
};

type AnalysisScheduleRestoreProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly enabled: boolean;
  readonly changedBy: string;
  readonly changedAt: Temporal.Instant;
};
