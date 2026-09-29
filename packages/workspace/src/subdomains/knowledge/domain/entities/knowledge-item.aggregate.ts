import { Aggregate, ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import {
  KnowledgeItemChangedException,
  KnowledgeItemNotApprovedException,
  KnowledgeItemNotDraftException,
  KnowledgeKindMismatchException,
  RationaleRequiredException,
  SupersededItemNotApprovedException,
} from '../exceptions/index.js';
import {
  KnowledgeItemId,
  KnowledgeItemVersion,
  KnowledgeKey,
  KnowledgeKind,
  KnowledgeSource,
  KnowledgeStatus,
  KnowledgeTitle,
  Rationale,
  RejectionReason,
  RetirementReason,
  type KnowledgeContent,
} from '../value-objects/index.js';

/**
 * One piece of what is known about a Project. Its Kind comes with its
 * Knowledge Key and never changes. A Draft changes freely; an Approved item
 * only becomes Obsolete, by Supersession or Retirement. Every change is made
 * on the version its author last saw.
 */
export class KnowledgeItem extends Aggregate<KnowledgeItemId> {
  readonly #workspaceId: WorkspaceId;
  readonly #projectId: ProjectId;
  readonly #key: KnowledgeKey;
  #title: KnowledgeTitle;
  #status: KnowledgeStatus;
  readonly #source: KnowledgeSource;
  #rationale: Rationale | null;
  #content: KnowledgeContent;
  readonly #authorId: MemberId;
  readonly #recordedAt: Temporal.Instant;
  #lastEditedBy: MemberId | null;
  #lastEditedAt: Temporal.Instant | null;
  #approvedBy: MemberId | null;
  #approvedAt: Temporal.Instant | null;
  #rejectedBy: MemberId | null;
  #rejectedAt: Temporal.Instant | null;
  #rejectionReason: RejectionReason | null;
  readonly #supersedes: KnowledgeKey | null;
  #supersededBy: MemberId | null;
  #supersededAt: Temporal.Instant | null;
  #supersededByKey: KnowledgeKey | null;
  #retiredBy: MemberId | null;
  #retiredAt: Temporal.Instant | null;
  #retirementReason: RetirementReason | null;
  #version: KnowledgeItemVersion;

  private constructor(id: KnowledgeItemId, state: KnowledgeItemState) {
    super(id);
    this.#workspaceId = state.workspaceId;
    this.#projectId = state.projectId;
    this.#key = state.key;
    this.#title = state.title;
    this.#status = state.status;
    this.#source = state.source;
    this.#rationale = state.rationale;
    this.#content = state.content;
    this.#authorId = state.authorId;
    this.#recordedAt = state.recordedAt;
    this.#lastEditedBy = state.lastEditedBy;
    this.#lastEditedAt = state.lastEditedAt;
    this.#approvedBy = state.approvedBy;
    this.#approvedAt = state.approvedAt;
    this.#rejectedBy = state.rejectedBy;
    this.#rejectedAt = state.rejectedAt;
    this.#rejectionReason = state.rejectionReason;
    this.#supersedes = state.supersedes;
    this.#supersededBy = state.supersededBy;
    this.#supersededAt = state.supersededAt;
    this.#supersededByKey = state.supersededByKey;
    this.#retiredBy = state.retiredBy;
    this.#retiredAt = state.retiredAt;
    this.#retirementReason = state.retirementReason;
    this.#version = state.version;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get projectId(): ProjectId {
    return this.#projectId;
  }

  get key(): KnowledgeKey {
    return this.#key;
  }

  get kind(): KnowledgeKind {
    return this.#key.kind;
  }

  get title(): KnowledgeTitle {
    return this.#title;
  }

  get status(): KnowledgeStatus {
    return this.#status;
  }

  get source(): KnowledgeSource {
    return this.#source;
  }

  get rationale(): Rationale | null {
    return this.#rationale;
  }

  get content(): KnowledgeContent {
    return this.#content;
  }

  /** The Member who recorded it; stays when others edit it. */
  get authorId(): MemberId {
    return this.#authorId;
  }

  get recordedAt(): Temporal.Instant {
    return this.#recordedAt;
  }

  /** Null until someone edits it. */
  get lastEditedBy(): MemberId | null {
    return this.#lastEditedBy;
  }

  /** Null until someone edits it. */
  get lastEditedAt(): Temporal.Instant | null {
    return this.#lastEditedAt;
  }

  /** Null unless Approved. */
  get approvedBy(): MemberId | null {
    return this.#approvedBy;
  }

  /** Null unless Approved. */
  get approvedAt(): Temporal.Instant | null {
    return this.#approvedAt;
  }

  /** Null unless Rejected. */
  get rejectedBy(): MemberId | null {
    return this.#rejectedBy;
  }

  /** Null unless Rejected. */
  get rejectedAt(): Temporal.Instant | null {
    return this.#rejectedAt;
  }

  /** Null unless Rejected with a reason. */
  get rejectionReason(): RejectionReason | null {
    return this.#rejectionReason;
  }

  /** The Approved item of the same Kind this one replaces once approved, if any. */
  get supersedes(): KnowledgeKey | null {
    return this.#supersedes;
  }

  /** Null unless replaced: who approved the replacement. */
  get supersededBy(): MemberId | null {
    return this.#supersededBy;
  }

  /** Null unless replaced. */
  get supersededAt(): Temporal.Instant | null {
    return this.#supersededAt;
  }

  /** Null unless replaced. */
  get supersededByKey(): KnowledgeKey | null {
    return this.#supersededByKey;
  }

  /** Null unless retired. */
  get retiredBy(): MemberId | null {
    return this.#retiredBy;
  }

  /** Null unless retired. */
  get retiredAt(): Temporal.Instant | null {
    return this.#retiredAt;
  }

  /** Null unless retired with a reason. */
  get retirementReason(): RetirementReason | null {
    return this.#retirementReason;
  }

  get version(): KnowledgeItemVersion {
    return this.#version;
  }

  public isDraft(): boolean {
    return this.#status.equals(KnowledgeStatus.Draft);
  }

  public isApproved(): boolean {
    return this.#status.equals(KnowledgeStatus.Approved);
  }

  /** Records a Draft; its Kind is the Kind of its content. */
  public static record(props: KnowledgeItemRecordProps): KnowledgeItem {
    if (props.source.requiresRationale() && props.rationale === null) {
      throw new RationaleRequiredException();
    }
    if (props.supersedes && !props.supersedes.kind.equals(props.content.kind)) {
      throw new KnowledgeKindMismatchException();
    }

    return new KnowledgeItem(new KnowledgeItemId(), {
      workspaceId: new WorkspaceId(props.workspaceId),
      projectId: new ProjectId(props.projectId),
      key: new KnowledgeKey(props.content.kind, props.number),
      title: new KnowledgeTitle(props.title),
      status: KnowledgeStatus.Draft,
      source: props.source,
      rationale:
        props.rationale === null ? null : new Rationale(props.rationale),
      content: props.content,
      authorId: new MemberId(props.authorId),
      recordedAt: Temporal.Now.instant(),
      lastEditedBy: null,
      lastEditedAt: null,
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      supersedes: props.supersedes,
      supersededBy: null,
      supersededAt: null,
      supersededByKey: null,
      retiredBy: null,
      retiredAt: null,
      retirementReason: null,
      version: KnowledgeItemVersion.First,
    });
  }

  public static restore(props: KnowledgeItemRestoreProps): KnowledgeItem {
    const key = new KnowledgeKey(KnowledgeKind.from(props.kind), props.number);
    if (!props.content.kind.equals(key.kind)) {
      throw new KnowledgeKindMismatchException();
    }

    return new KnowledgeItem(new KnowledgeItemId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      projectId: new ProjectId(props.projectId),
      key,
      title: new KnowledgeTitle(props.title),
      status: KnowledgeStatus.from(props.status),
      source: KnowledgeSource.from(props.source),
      rationale:
        props.rationale === null ? null : new Rationale(props.rationale),
      content: props.content,
      authorId: new MemberId(props.authorId),
      recordedAt: props.recordedAt,
      lastEditedBy: toMemberId(props.lastEditedBy),
      lastEditedAt: props.lastEditedAt,
      approvedBy: toMemberId(props.approvedBy),
      approvedAt: props.approvedAt,
      rejectedBy: toMemberId(props.rejectedBy),
      rejectedAt: props.rejectedAt,
      rejectionReason: RejectionReason.optional(props.rejectionReason),
      supersedes: toKey(props.supersedes),
      supersededBy: toMemberId(props.supersededBy),
      supersededAt: props.supersededAt,
      supersededByKey: toKey(props.supersededByKey),
      retiredBy: toMemberId(props.retiredBy),
      retiredAt: props.retiredAt,
      retirementReason: RetirementReason.optional(props.retirementReason),
      version: new KnowledgeItemVersion(props.version),
    });
  }

  /** Changes what is given and records who edited it last and when. */
  public edit(
    editorId: MemberId,
    seenVersion: KnowledgeItemVersion,
    changes: KnowledgeItemChanges,
  ): void {
    this.#ensureChangeable(seenVersion);
    if (changes.content && !changes.content.kind.equals(this.kind)) {
      throw new KnowledgeKindMismatchException();
    }
    if (changes.title !== undefined) {
      this.#title = new KnowledgeTitle(changes.title);
    }
    if (changes.rationale === null && this.#source.requiresRationale()) {
      throw new RationaleRequiredException();
    }
    if (changes.rationale !== undefined) {
      this.#rationale =
        changes.rationale === null ? null : new Rationale(changes.rationale);
    }
    if (changes.content) {
      this.#content = changes.content;
    }
    this.#lastEditedBy = editorId;
    this.#lastEditedAt = Temporal.Now.instant();
    this.#version = this.#version.next();
  }

  /** A Member confirms, on the version they read, that it is true for the Project. */
  public approve(
    approverId: MemberId,
    seenVersion: KnowledgeItemVersion,
  ): void {
    this.#ensureChangeable(seenVersion);
    this.#status = KnowledgeStatus.Approved;
    this.#approvedBy = approverId;
    this.#approvedAt = Temporal.Now.instant();
    this.#version = this.#version.next();
  }

  /** A person turns it down as not true for the Project; a blank reason means none. */
  public reject(
    rejecterId: MemberId,
    seenVersion: KnowledgeItemVersion,
    reason: string | null,
  ): void {
    this.#ensureChangeable(seenVersion);
    this.#status = KnowledgeStatus.Rejected;
    this.#rejectedBy = rejecterId;
    this.#rejectedAt = Temporal.Now.instant();
    this.#rejectionReason = RejectionReason.optional(reason);
    this.#version = this.#version.next();
  }

  /** Only a Draft, on the version the deleter saw, can be deleted. */
  public ensureDeletable(seenVersion: KnowledgeItemVersion): void {
    this.#ensureChangeable(seenVersion);
  }

  /** Its replacement was approved: it becomes Obsolete, "superseded by" the replacement. */
  public becomeSupersededBy(
    replacementKey: KnowledgeKey,
    approverId: MemberId,
  ): void {
    if (!this.isApproved()) {
      throw new SupersededItemNotApprovedException();
    }
    this.#status = KnowledgeStatus.Obsolete;
    this.#supersededBy = approverId;
    this.#supersededAt = Temporal.Now.instant();
    this.#supersededByKey = replacementKey;
    this.#version = this.#version.next();
  }

  /** A person marks it Obsolete with nothing to replace it; a blank reason means none. */
  public retire(
    retirerId: MemberId,
    seenVersion: KnowledgeItemVersion,
    reason: string | null,
  ): void {
    if (!this.isApproved()) {
      throw new KnowledgeItemNotApprovedException();
    }
    this.#ensureSeen(seenVersion);
    this.#status = KnowledgeStatus.Obsolete;
    this.#retiredBy = retirerId;
    this.#retiredAt = Temporal.Now.instant();
    this.#retirementReason = RetirementReason.optional(reason);
    this.#version = this.#version.next();
  }

  #ensureChangeable(seenVersion: KnowledgeItemVersion): void {
    if (!this.isDraft()) {
      throw new KnowledgeItemNotDraftException();
    }
    this.#ensureSeen(seenVersion);
  }

  #ensureSeen(seenVersion: KnowledgeItemVersion): void {
    if (!seenVersion.equals(this.#version)) {
      throw new KnowledgeItemChangedException();
    }
  }
}

function toMemberId(value: string | null): MemberId | null {
  return value === null ? null : new MemberId(value);
}

function toKey(value: string | null): KnowledgeKey | null {
  return value === null ? null : KnowledgeKey.parse(value);
}

type KnowledgeItemState = {
  readonly workspaceId: WorkspaceId;
  readonly projectId: ProjectId;
  readonly key: KnowledgeKey;
  readonly title: KnowledgeTitle;
  readonly status: KnowledgeStatus;
  readonly source: KnowledgeSource;
  readonly rationale: Rationale | null;
  readonly content: KnowledgeContent;
  readonly authorId: MemberId;
  readonly recordedAt: Temporal.Instant;
  readonly lastEditedBy: MemberId | null;
  readonly lastEditedAt: Temporal.Instant | null;
  readonly approvedBy: MemberId | null;
  readonly approvedAt: Temporal.Instant | null;
  readonly rejectedBy: MemberId | null;
  readonly rejectedAt: Temporal.Instant | null;
  readonly rejectionReason: RejectionReason | null;
  readonly supersedes: KnowledgeKey | null;
  readonly supersededBy: MemberId | null;
  readonly supersededAt: Temporal.Instant | null;
  readonly supersededByKey: KnowledgeKey | null;
  readonly retiredBy: MemberId | null;
  readonly retiredAt: Temporal.Instant | null;
  readonly retirementReason: RetirementReason | null;
  readonly version: KnowledgeItemVersion;
};
type KnowledgeItemRecordProps = {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly source: KnowledgeSource;
  /** The next number of the content's Kind in the Project. */
  readonly number: number;
  readonly title: string;
  readonly rationale: string | null;
  readonly content: KnowledgeContent;
  readonly authorId: string;
  /** The Approved item of the same Kind it replaces once approved, if any. */
  readonly supersedes: KnowledgeKey | null;
};
type KnowledgeItemRestoreProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly kind: string;
  readonly number: number;
  readonly title: string;
  readonly status: string;
  readonly source: string;
  readonly rationale: string | null;
  readonly content: KnowledgeContent;
  readonly authorId: string;
  readonly recordedAt: Temporal.Instant;
  readonly lastEditedBy: string | null;
  readonly lastEditedAt: Temporal.Instant | null;
  readonly approvedBy: string | null;
  readonly approvedAt: Temporal.Instant | null;
  readonly rejectedBy: string | null;
  readonly rejectedAt: Temporal.Instant | null;
  readonly rejectionReason: string | null;
  readonly supersedes: string | null;
  readonly supersededBy: string | null;
  readonly supersededAt: Temporal.Instant | null;
  readonly supersededByKey: string | null;
  readonly retiredBy: string | null;
  readonly retiredAt: Temporal.Instant | null;
  readonly retirementReason: string | null;
  readonly version: number;
};
/** What to change; a field left out stays as it is, a null rationale clears it. */
export type KnowledgeItemChanges = {
  readonly title?: string;
  readonly rationale?: string | null;
  readonly content?: KnowledgeContent;
};
