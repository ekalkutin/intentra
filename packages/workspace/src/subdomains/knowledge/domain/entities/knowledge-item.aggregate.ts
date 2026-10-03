import { Aggregate, ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import {
  InvalidLinkException,
  KnowledgeItemChangedException,
  KnowledgeItemNeedsReviewException,
  KnowledgeItemNotApprovedException,
  KnowledgeItemNotDraftException,
  KnowledgeItemNotMarkedException,
  KnowledgeKindMismatchException,
  RationaleRequiredException,
  SupersededItemNotApprovedException,
} from '../exceptions/index.js';
import {
  KnowledgeAuthor,
  KnowledgeItemId,
  KnowledgeItemVersion,
  KnowledgeKey,
  KnowledgeKind,
  KnowledgeLink,
  KnowledgeLinkType,
  KnowledgeSource,
  KnowledgeStatus,
  KnowledgeTitle,
  Rationale,
  RejectionReason,
  RequirementContent,
  RequirementType,
  RetirementReason,
  sameKnowledgeContent,
  type KnowledgeContent,
  type KnowledgeLinkProps,
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
  readonly #author: KnowledgeAuthor;
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
  #links: readonly KnowledgeLink[];
  #reviewCauses: readonly KnowledgeKey[];
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
    this.#author = state.author;
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
    this.#links = state.links;
    this.#reviewCauses = state.reviewCauses;
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
  get author(): KnowledgeAuthor {
    return this.#author;
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

  get links(): readonly KnowledgeLink[] {
    return this.#links;
  }

  /** The targets whose change marked it Needs Review; empty when it is not marked. */
  get reviewCauses(): readonly KnowledgeKey[] {
    return this.#reviewCauses;
  }

  get version(): KnowledgeItemVersion {
    return this.#version;
  }

  public needsReview(): boolean {
    return this.#reviewCauses.length > 0;
  }

  /** The targets of its `depends on` Links, which must be Approved before it is. */
  public dependencies(): readonly KnowledgeKey[] {
    return this.#links
      .filter(link => link.type.equals(KnowledgeLinkType.DependsOn))
      .map(link => link.target);
  }

  /** The Open Questions it settles: the targets of its `answers` Links. */
  public answeredQuestions(): readonly KnowledgeKey[] {
    return this.#links
      .filter(link => link.type.equals(KnowledgeLinkType.Answers))
      .map(link => link.target);
  }

  /**
   * Whether, as the replacement of `replaced`, it says the same and only adds
   * Links: then what rested on `replaced` still holds on it.
   */
  public onlyAddsLinksTo(replaced: KnowledgeItem): boolean {
    return (
      this.#title.equals(replaced.title) &&
      sameKnowledgeContent(this.#content, replaced.content) &&
      replaced.links.every(link => this.#links.some(own => own.equals(link)))
    );
  }

  /** Whether a change of the given item puts this one in question. */
  public restsOn(key: KnowledgeKey): boolean {
    return this.#links.some(
      link => link.type.marksForReview() && link.target.equals(key),
    );
  }

  public isDraft(): boolean {
    return this.#status.equals(KnowledgeStatus.Draft);
  }

  public isApproved(): boolean {
    return this.#status.equals(KnowledgeStatus.Approved);
  }

  /**
   * Whether it is of a Kind the Project Frame holds when Approved, whatever it
   * links to: the Product Overview, a Constraint, a non-functional Requirement.
   */
  public isOfProjectFrame(): boolean {
    return (
      this.kind.equals(KnowledgeKind.ProductOverview) ||
      this.kind.equals(KnowledgeKind.Constraint) ||
      (this.#content instanceof RequirementContent &&
        this.#content.type === RequirementType.NonFunctional)
    );
  }

  /** Records a Draft; its Kind is the Kind of its content. */
  public static record(props: KnowledgeItemRecordProps): KnowledgeItem {
    if (props.source.requiresRationale() && props.rationale === null) {
      throw new RationaleRequiredException();
    }
    if (props.supersedes && !props.supersedes.kind.equals(props.content.kind)) {
      throw new KnowledgeKindMismatchException();
    }
    const key = new KnowledgeKey(props.content.kind, props.number);
    ensureValidLinks(key, props.links);

    return new KnowledgeItem(new KnowledgeItemId(), {
      workspaceId: new WorkspaceId(props.workspaceId),
      projectId: new ProjectId(props.projectId),
      key,
      title: new KnowledgeTitle(props.title),
      status: KnowledgeStatus.Draft,
      source: props.source,
      rationale:
        props.rationale === null ? null : new Rationale(props.rationale),
      content: props.content,
      author: KnowledgeAuthor.from(props.authorId),
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
      links: props.links,
      reviewCauses: [],
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
      author: KnowledgeAuthor.from(props.authorId),
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
      links: props.links.map(link => KnowledgeLink.from(link)),
      reviewCauses: props.reviewCauses.map(cause => KnowledgeKey.parse(cause)),
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
    if (changes.links) {
      ensureValidLinks(this.#key, changes.links);
      this.#links = changes.links;
      // Editing clears the mark only where it no longer rests on what changed.
      this.#reviewCauses = this.#reviewCauses.filter(cause =>
        this.restsOn(cause),
      );
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
    if (this.needsReview()) {
      throw new KnowledgeItemNeedsReviewException();
    }
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
    this.#reviewCauses = [];
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
    this.#reviewCauses = [];
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
    this.#reviewCauses = [];
    this.#version = this.#version.next();
  }

  /**
   * Something it depends on or is justified by was rejected, superseded or
   * retired. Only a Draft or an Approved item is marked; Rejected and Obsolete
   * ones are no longer part of the knowledge.
   */
  public markForReview(cause: KnowledgeKey): void {
    const current = this.isDraft() || this.isApproved();
    if (!current || this.#reviewCauses.some(marked => marked.equals(cause))) {
      return;
    }
    this.#reviewCauses = [...this.#reviewCauses, cause];
    this.#version = this.#version.next();
  }

  /**
   * What it rests on was replaced by an item that says the same and only adds
   * Links: its Links to `replaced` move onto `replacement`, with no Needs
   * Review. Besides a confirmation, the one change an Approved item's Links
   * ever get.
   */
  public followReplacement(
    replaced: KnowledgeKey,
    replacement: KnowledgeKey,
  ): void {
    if (!this.#links.some(link => link.target.equals(replaced))) {
      return;
    }
    const links: KnowledgeLink[] = [];
    for (const link of this.#links) {
      const moved = link.target.equals(replaced)
        ? link.aimedAt(replacement)
        : link;
      if (!links.some(kept => kept.equals(moved))) {
        links.push(moved);
      }
    }
    this.#links = links;
    this.#version = this.#version.next();
  }

  /**
   * A person has checked that it still holds on what its changed targets
   * became: its Links to them move onto their replacements, or away if there
   * is none.
   */
  public confirm(
    seenVersion: KnowledgeItemVersion,
    replacementOf: (cause: KnowledgeKey) => KnowledgeKey | null,
  ): void {
    if (!this.needsReview()) {
      throw new KnowledgeItemNotMarkedException();
    }
    this.#ensureSeen(seenVersion);
    const links: KnowledgeLink[] = [];
    for (const link of this.#links) {
      const caused = this.#reviewCauses.some(cause =>
        cause.equals(link.target),
      );
      const replacement = caused ? replacementOf(link.target) : link.target;
      const moved = replacement && link.aimedAt(replacement);
      if (moved && !links.some(kept => kept.equals(moved))) {
        links.push(moved);
      }
    }
    this.#links = links;
    this.#reviewCauses = [];
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

/**
 * A Link is of a type its item's Kind may hold, leads to another item, and is
 * there once.
 */
function ensureValidLinks(
  key: KnowledgeKey,
  links: readonly KnowledgeLink[],
): void {
  const valid = links.every(
    (link, index) =>
      link.type.allowsSource(key.kind) &&
      !link.target.equals(key) &&
      links.findIndex(other => other.equals(link)) === index,
  );
  if (!valid) {
    throw new InvalidLinkException();
  }
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
  readonly author: KnowledgeAuthor;
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
  readonly links: readonly KnowledgeLink[];
  readonly reviewCauses: readonly KnowledgeKey[];
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
  /** The Member who records it; null for Intentra itself, in an Analysis Run. */
  readonly authorId: string | null;
  /** The Approved item of the same Kind it replaces once approved, if any. */
  readonly supersedes: KnowledgeKey | null;
  readonly links: readonly KnowledgeLink[];
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
  readonly authorId: string | null;
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
  readonly links: readonly KnowledgeLinkProps[];
  readonly reviewCauses: readonly string[];
  readonly version: number;
};
/** What to change; a field left out stays as it is, a null rationale clears it. */
export type KnowledgeItemChanges = {
  readonly title?: string;
  readonly rationale?: string | null;
  readonly content?: KnowledgeContent;
  /** Replaces all of its Links. */
  readonly links?: readonly KnowledgeLink[];
};
