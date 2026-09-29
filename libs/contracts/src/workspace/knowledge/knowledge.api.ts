import type { CallerDto } from '../access/caller.dto.js';

import type { EditKnowledgeItemDto } from './edit-knowledge-item.dto.js';
import type {
  ApproveKnowledgeItemDto,
  DeleteKnowledgeItemDto,
  RejectKnowledgeItemDto,
  RetireKnowledgeItemDto,
} from './knowledge-item-change.dto.js';
import type {
  KnowledgeItemDto,
  KnowledgeItemPageDto,
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

  /** Sorted by Kind, then by the Knowledge Key's number. */
  abstract list(
    caller: CallerDto,
    workspaceId: string,
    projectId: string,
    query: ListKnowledgeItemsDto,
  ): Promise<KnowledgeItemPageDto>;

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

  /** Approving a Draft that `supersedes` an item also makes that item Obsolete. */
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
}
