import type { Actor } from '../../iam/index.js';

import type { EditKnowledgeItemDto } from './edit-knowledge-item.dto.js';
import type {
  ApproveKnowledgeItemDto,
  DeleteKnowledgeItemDto,
  RejectKnowledgeItemDto,
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
 * Member reads. A Knowledge Item is addressed by its Knowledge Key, such as
 * `REQ-12`. Every change but a recording applies only to a Draft
 * (409 `KNOWLEDGE_ITEM_NOT_DRAFT`) and only to the version the client saw
 * (409 `KNOWLEDGE_ITEM_CHANGED`).
 */
export abstract class KnowledgeApi {
  abstract record(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    data: RecordKnowledgeItemDto,
  ): Promise<KnowledgeItemDto>;

  /** Sorted by Kind, then by the Knowledge Key's number. */
  abstract list(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    query: ListKnowledgeItemsDto,
  ): Promise<KnowledgeItemPageDto>;

  /** Reads a Knowledge Item in any status, Rejected included. */
  abstract get(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
  ): Promise<KnowledgeItemDto>;

  abstract edit(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
    data: EditKnowledgeItemDto,
  ): Promise<KnowledgeItemDto>;

  /** Deletion: removes a Draft recorded by mistake, leaving no trace. */
  abstract delete(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
    data: DeleteKnowledgeItemDto,
  ): Promise<void>;

  abstract approve(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
    data: ApproveKnowledgeItemDto,
  ): Promise<KnowledgeItemDto>;

  abstract reject(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    key: string,
    data: RejectKnowledgeItemDto,
  ): Promise<KnowledgeItemDto>;
}
