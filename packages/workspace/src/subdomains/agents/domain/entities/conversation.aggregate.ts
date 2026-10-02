import { Aggregate, ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import { ConversationId, ConversationTitle } from '../value-objects/index.js';

/**
 * A private exchange between one Member and Intentra in a Project.
 * Its messages are kept by the Agents' runtime, not here.
 */
export class Conversation extends Aggregate<ConversationId> {
  readonly #workspaceId: WorkspaceId;
  readonly #projectId: ProjectId;
  readonly #memberId: MemberId;
  #title: ConversationTitle | null;
  #hidden: boolean;
  readonly #createdAt: Temporal.Instant;
  readonly #updatedAt: Temporal.Instant;

  private constructor(id: ConversationId, state: ConversationState) {
    super(id);
    this.#workspaceId = state.workspaceId;
    this.#projectId = state.projectId;
    this.#memberId = state.memberId;
    this.#title = state.title;
    this.#hidden = state.hidden;
    this.#createdAt = state.createdAt;
    this.#updatedAt = state.updatedAt;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get projectId(): ProjectId {
    return this.#projectId;
  }

  get memberId(): MemberId {
    return this.#memberId;
  }

  /** Null until Intentra suggests one from the Conversation's start. */
  get title(): ConversationTitle | null {
    return this.#title;
  }

  get hidden(): boolean {
    return this.#hidden;
  }

  get createdAt(): Temporal.Instant {
    return this.#createdAt;
  }

  get updatedAt(): Temporal.Instant {
    return this.#updatedAt;
  }

  /** Its Member names it; Intentra's suggestion only fills a missing title. */
  public rename(title: string): void {
    this.#title = new ConversationTitle(title);
  }

  /** Out of the Member's list of Conversations, not gone. */
  public hide(): void {
    this.#hidden = true;
  }

  public show(): void {
    this.#hidden = false;
  }

  /** Only its Member reaches it, and only in its Project. */
  public isOf(memberId: MemberId, projectId: ProjectId): boolean {
    return this.#memberId.equals(memberId) && this.#projectId.equals(projectId);
  }

  /** A Conversation begun by its Member's first message, under the id the client chose. */
  public static start(props: ConversationStartProps): Conversation {
    const now = Temporal.Now.instant();

    return new Conversation(new ConversationId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      projectId: new ProjectId(props.projectId),
      memberId: new MemberId(props.memberId),
      title: null,
      hidden: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static restore(props: ConversationRestoreProps): Conversation {
    return new Conversation(new ConversationId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      projectId: new ProjectId(props.projectId),
      memberId: new MemberId(props.memberId),
      title: props.title === null ? null : new ConversationTitle(props.title),
      hidden: props.hidden,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });
  }
}

type ConversationState = {
  readonly workspaceId: WorkspaceId;
  readonly projectId: ProjectId;
  readonly memberId: MemberId;
  readonly title: ConversationTitle | null;
  readonly hidden: boolean;
  readonly createdAt: Temporal.Instant;
  readonly updatedAt: Temporal.Instant;
};
type ConversationStartProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly memberId: string;
};
type ConversationRestoreProps = ConversationStartProps & {
  readonly title: string | null;
  readonly hidden: boolean;
  readonly createdAt: Temporal.Instant;
  readonly updatedAt: Temporal.Instant;
};
