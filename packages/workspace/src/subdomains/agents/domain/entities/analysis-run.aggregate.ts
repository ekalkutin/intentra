import { Aggregate, ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import { AnalysisRunFinishedException } from '../exceptions/index.js';
import {
  AgentsVersionNumber,
  AnalysisRunFailure,
  AnalysisRunId,
  AnalysisRunScope,
  AnalysisRunStatus,
} from '../value-objects/index.js';

/**
 * One pass in which the Auditor looks over a Project's knowledge item by item,
 * without a Conversation. It remembers who started it, how far it got and
 * what it found: the Open Questions it recorded, as Intentra, by Knowledge Key.
 */
export class AnalysisRun extends Aggregate<AnalysisRunId> {
  readonly #workspaceId: WorkspaceId;
  readonly #projectId: ProjectId;
  readonly #scope: AnalysisRunScope;
  #itemCount: number;
  #checkedCount: number;
  readonly #startedBy: MemberId | null;
  readonly #startedAt: Temporal.Instant;
  #agentsVersion: AgentsVersionNumber | null;
  #status: AnalysisRunStatus;
  #finishedAt: Temporal.Instant | null;
  #questionKeys: readonly string[];
  #stepLimitReached: boolean;
  #failure: AnalysisRunFailure | null;

  private constructor(id: AnalysisRunId, state: AnalysisRunState) {
    super(id);
    this.#workspaceId = state.workspaceId;
    this.#projectId = state.projectId;
    this.#scope = state.scope;
    this.#itemCount = state.itemCount;
    this.#checkedCount = state.checkedCount;
    this.#startedBy = state.startedBy;
    this.#startedAt = state.startedAt;
    this.#agentsVersion = state.agentsVersion;
    this.#status = state.status;
    this.#finishedAt = state.finishedAt;
    this.#questionKeys = state.questionKeys;
    this.#stepLimitReached = state.stepLimitReached;
    this.#failure = state.failure;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get projectId(): ProjectId {
    return this.#projectId;
  }

  get scope(): AnalysisRunScope {
    return this.#scope;
  }

  /** How many items it is to look at; 0 until it knows. */
  get itemCount(): number {
    return this.#itemCount;
  }

  /** How many of them it has looked at so far. */
  get checkedCount(): number {
    return this.#checkedCount;
  }

  /** The Member who started it by hand; null for one the schedule started. */
  get startedBy(): MemberId | null {
    return this.#startedBy;
  }

  get startedAt(): Temporal.Instant {
    return this.#startedAt;
  }

  /** The Agents Version the Auditor came from; null until it is known. */
  get agentsVersion(): AgentsVersionNumber | null {
    return this.#agentsVersion;
  }

  get status(): AnalysisRunStatus {
    return this.#status;
  }

  get finishedAt(): Temporal.Instant | null {
    return this.#finishedAt;
  }

  /** The Knowledge Keys of the Open Questions it recorded. */
  get questionKeys(): readonly string[] {
    return this.#questionKeys;
  }

  /** Whether a run from before runs went item by item stopped at the most steps it could take; always false since. */
  get stepLimitReached(): boolean {
    return this.#stepLimitReached;
  }

  get failure(): AnalysisRunFailure | null {
    return this.#failure;
  }

  public isRunning(): boolean {
    return this.#status.equals(AnalysisRunStatus.Running);
  }

  public static start(props: AnalysisRunStartProps): AnalysisRun {
    return new AnalysisRun(new AnalysisRunId(), {
      workspaceId: new WorkspaceId(props.workspaceId),
      projectId: new ProjectId(props.projectId),
      scope: props.scope,
      itemCount: 0,
      checkedCount: 0,
      startedBy:
        props.startedBy === null ? null : new MemberId(props.startedBy),
      startedAt: Temporal.Now.instant(),
      agentsVersion: null,
      status: AnalysisRunStatus.Running,
      finishedAt: null,
      questionKeys: [],
      stepLimitReached: false,
      failure: null,
    });
  }

  public static restore(props: AnalysisRunRestoreProps): AnalysisRun {
    return new AnalysisRun(new AnalysisRunId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      projectId: new ProjectId(props.projectId),
      scope: AnalysisRunScope.from(props.scope),
      itemCount: props.itemCount,
      checkedCount: props.checkedCount,
      startedBy:
        props.startedBy === null ? null : new MemberId(props.startedBy),
      startedAt: props.startedAt,
      agentsVersion:
        props.agentsVersion === null
          ? null
          : new AgentsVersionNumber(props.agentsVersion),
      status: AnalysisRunStatus.from(props.status),
      finishedAt: props.finishedAt,
      questionKeys: props.questionKeys,
      stepLimitReached: props.stepLimitReached,
      failure:
        props.failure === null ? null : AnalysisRunFailure.from(props.failure),
    });
  }

  /** The Auditor that carries it out comes from this Agents Version. */
  public runOn(agentsVersion: AgentsVersionNumber): void {
    this.ensureRunning();
    this.#agentsVersion = agentsVersion;
  }

  /** It is to look at this many items. */
  public plan(itemCount: number): void {
    this.ensureRunning();
    this.#itemCount = itemCount;
  }

  /** One more item looked at, with the Open Questions recorded about it. */
  public checkOne(questionKeys: readonly string[]): void {
    this.ensureRunning();
    this.#checkedCount += 1;
    this.#questionKeys = [...new Set([...this.#questionKeys, ...questionKeys])];
  }

  public complete(): void {
    this.ensureRunning();
    this.#status = AnalysisRunStatus.Completed;
    this.#finishedAt = Temporal.Now.instant();
  }

  /** What it recorded and the items it looked at before failing stay so; the rest stay Unchecked. */
  public fail(failure: AnalysisRunFailure): void {
    this.ensureRunning();
    this.#status = AnalysisRunStatus.Failed;
    this.#finishedAt = Temporal.Now.instant();
    this.#failure = failure;
  }

  private ensureRunning(): void {
    if (!this.isRunning()) {
      throw new AnalysisRunFinishedException();
    }
  }
}

type AnalysisRunState = {
  readonly workspaceId: WorkspaceId;
  readonly projectId: ProjectId;
  readonly scope: AnalysisRunScope;
  readonly itemCount: number;
  readonly checkedCount: number;
  readonly startedBy: MemberId | null;
  readonly startedAt: Temporal.Instant;
  readonly agentsVersion: AgentsVersionNumber | null;
  readonly status: AnalysisRunStatus;
  readonly finishedAt: Temporal.Instant | null;
  readonly questionKeys: readonly string[];
  readonly stepLimitReached: boolean;
  readonly failure: AnalysisRunFailure | null;
};

type AnalysisRunStartProps = {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly scope: AnalysisRunScope;
  /** The Member who starts it by hand; null for the schedule. */
  readonly startedBy: string | null;
};

type AnalysisRunRestoreProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly scope: string;
  readonly itemCount: number;
  readonly checkedCount: number;
  readonly startedBy: string | null;
  readonly startedAt: Temporal.Instant;
  readonly agentsVersion: number | null;
  readonly status: string;
  readonly finishedAt: Temporal.Instant | null;
  readonly questionKeys: readonly string[];
  readonly stepLimitReached: boolean;
  readonly failure: string | null;
};
