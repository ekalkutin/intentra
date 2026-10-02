import type { CallerDto } from '../access/caller.dto.js';

import type { EditKnowledgeItemDto } from './edit-knowledge-item.dto.js';
import type {
  GetKnowledgeContextDto,
  KnowledgeContextDto,
  KnowledgeFrameDto,
} from './knowledge-context.dto.js';
import type { KnowledgeGapsDto } from './knowledge-gap.dto.js';
import type {
  ApproveKnowledgeItemDto,
  ApproveKnowledgeItemsDto,
  ConfirmKnowledgeItemDto,
  DeleteKnowledgeItemDto,
  RejectKnowledgeItemDto,
  RetireKnowledgeItemDto,
} from './knowledge-item-change.dto.js';
import type {
  KnowledgeDependenciesDto,
  KnowledgeItemDto,
  KnowledgeItemPageDto,
  KnowledgeSummaryDto,
} from './knowledge-item.dto.js';
import type { ListKnowledgeItemsDto } from './list-knowledge-items.dto.js';
import type { RecordKnowledgeItemDto } from './record-knowledge-item.dto.js';

/**
 * A Project's knowledge. Contributors and Maintainers record, edit and delete
 * Drafts; only Maintainers approve and reject them (403 otherwise); every
 * Member reads. An external agent may do what the lower of its token's level
 * and the Member's Project Role allows, and what it records must carry a
 * rationale. A Knowledge Item is addressed by its Knowledge Key, such as
 * `REQ-12`. Every change but a recording or a retirement applies only to a
 * Draft (409 `KNOWLEDGE_ITEM_NOT_DRAFT`), and every one only to the version
 * the client saw (409 `KNOWLEDGE_ITEM_CHANGED`). An Approved item changes only
 * by Supersession (approving a Draft recorded with `supersedes`) or
 * Retirement.
 */
export abstract class KnowledgeApi {
  abstract record(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    data: RecordKnowledgeItemDto,
  ): Promise<KnowledgeItemDto>;

  /** Sorted by Kind, then by the Knowledge Key's number, or the newest first when asked. */
  abstract list(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    query: ListKnowledgeItemsDto,
  ): Promise<KnowledgeItemPageDto>;

  /**
   * Counts the Project's items by Kind and status, and those marked Needs
   * Review, over the whole Project (a list is read a page at a time).
   */
  abstract summary(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
  ): Promise<KnowledgeSummaryDto>;

  /**
   * The Project's Gaps: what is missing from its knowledge that needs no
   * judgement to see, found anew on every call. Every Member reads them.
   */
  abstract gaps(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
  ): Promise<KnowledgeGapsDto>;

  /** Reads a Knowledge Item in any status, Rejected included. */
  abstract get(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
  ): Promise<KnowledgeItemDto>;

  abstract edit(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: EditKnowledgeItemDto,
  ): Promise<KnowledgeItemDto>;

  /** Deletion: removes a Draft recorded by mistake, leaving no trace. */
  abstract delete(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: DeleteKnowledgeItemDto,
  ): Promise<void>;

  /** Everything the item reaches along `depends-on`, to review before approving it. */
  abstract dependencies(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
  ): Promise<KnowledgeDependenciesDto>;

  /**
   * The Context Pack for a task: the Approved knowledge gathered from its
   * Anchors along the Links. Every Anchor must be Approved (409
   * `ANCHOR_NOT_APPROVED` naming it otherwise); one that does not exist is
   * 404. Every Member reads it.
   */
  abstract context(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    query: GetKnowledgeContextDto,
  ): Promise<KnowledgeContextDto>;

  /** The Project Frame: what holds for every task, whatever it links to. Every Member reads it. */
  abstract frame(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
  ): Promise<KnowledgeFrameDto>;

  /**
   * Approving a Draft that `supersedes` an item also makes that item Obsolete.
   * Every `depends-on` target must be Approved already (409
   * `DEPENDENCIES_NOT_APPROVED` otherwise); approve Drafts together with
   * `approveTogether`.
   */
  abstract approve(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: ApproveKnowledgeItemDto,
  ): Promise<KnowledgeItemDto>;

  abstract reject(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: RejectKnowledgeItemDto,
  ): Promise<KnowledgeItemDto>;

  /** Marks an Approved item Obsolete with nothing to replace it. Maintainers only. */
  abstract retire(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: RetireKnowledgeItemDto,
  ): Promise<KnowledgeItemDto>;

  /** Approves Drafts together, all or nothing, such as an item and the Drafts it depends on. */
  abstract approveTogether(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    data: ApproveKnowledgeItemsDto,
  ): Promise<KnowledgeItemDto[]>;

  /**
   * Confirms that an item marked Needs Review still holds: its Links to the
   * changed targets move onto their replacements, or away if there is none.
   * Contributors and Maintainers confirm a Draft; only Maintainers an
   * Approved item.
   */
  abstract confirm(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    key: string,
    data: ConfirmKnowledgeItemDto,
  ): Promise<KnowledgeItemDto>;
}
