import { Aggregate, ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import { KnowledgeKindMismatchException } from '../exceptions/index.js';
import {
  KnowledgeItemId,
  KnowledgeKey,
  KnowledgeKind,
  KnowledgeSource,
  KnowledgeStatus,
  KnowledgeTitle,
  Rationale,
  type KnowledgeContent,
} from '../value-objects/index.js';

/**
 * One piece of what is known about a Project. Its Kind comes with its
 * Knowledge Key and never changes.
 */
export class KnowledgeItem extends Aggregate<KnowledgeItemId> {
  readonly #workspaceId: WorkspaceId;
  readonly #projectId: ProjectId;
  readonly #key: KnowledgeKey;
  #title: KnowledgeTitle;
  readonly #status: KnowledgeStatus;
  readonly #source: KnowledgeSource;
  #rationale: Rationale | null;
  #content: KnowledgeContent;
  readonly #authorId: MemberId;
  readonly #recordedAt: Temporal.Instant;
  #lastEditedBy: MemberId | null;
  #lastEditedAt: Temporal.Instant | null;

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

  /** A person enters a Draft by hand; its Kind is the Kind of its content. */
  public static record(props: KnowledgeItemRecordProps): KnowledgeItem {
    return new KnowledgeItem(new KnowledgeItemId(), {
      workspaceId: new WorkspaceId(props.workspaceId),
      projectId: new ProjectId(props.projectId),
      key: new KnowledgeKey(props.content.kind, props.number),
      title: new KnowledgeTitle(props.title),
      status: KnowledgeStatus.Draft,
      source: KnowledgeSource.Manual,
      rationale:
        props.rationale === null ? null : new Rationale(props.rationale),
      content: props.content,
      authorId: new MemberId(props.authorId),
      recordedAt: Temporal.Now.instant(),
      lastEditedBy: null,
      lastEditedAt: null,
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
      lastEditedBy:
        props.lastEditedBy === null ? null : new MemberId(props.lastEditedBy),
      lastEditedAt: props.lastEditedAt,
    });
  }

  /** Changes what is given and records who edited it last and when. */
  public edit(editorId: MemberId, changes: KnowledgeItemChanges): void {
    if (changes.content && !changes.content.kind.equals(this.kind)) {
      throw new KnowledgeKindMismatchException();
    }
    if (changes.title !== undefined) {
      this.#title = new KnowledgeTitle(changes.title);
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
  readonly authorId: MemberId;
  readonly recordedAt: Temporal.Instant;
  readonly lastEditedBy: MemberId | null;
  readonly lastEditedAt: Temporal.Instant | null;
};
type KnowledgeItemRecordProps = {
  readonly workspaceId: string;
  readonly projectId: string;
  /** The next number of the content's Kind in the Project. */
  readonly number: number;
  readonly title: string;
  readonly rationale: string | null;
  readonly content: KnowledgeContent;
  readonly authorId: string;
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
};
/** What to change; a field left out stays as it is, a null rationale clears it. */
export type KnowledgeItemChanges = {
  readonly title?: string;
  readonly rationale?: string | null;
  readonly content?: KnowledgeContent;
};
