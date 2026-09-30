import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { KnowledgeItem } from '../../../domain/entities/index.js';
import type {
  KnowledgeItemId,
  KnowledgeKey,
  KnowledgeKind,
  KnowledgeLinkType,
  KnowledgeStatus,
} from '../../../domain/value-objects/index.js';
import { KnowledgeItemNotFoundException } from '../../exceptions/index.js';

export type KnowledgeItemQueryProps = {
  readonly projectId: ProjectId;
  readonly key?: KnowledgeKey;
  readonly kind?: KnowledgeKind;
  /** Any of these; every status when left out. */
  readonly statuses?: readonly KnowledgeStatus[];
  /** Any of these Knowledge Keys; none when empty. */
  readonly keys?: readonly KnowledgeKey[];
  /** Items with a Link to any of these keys, of any of these types (any type when left out). */
  readonly linkingTo?: {
    readonly keys: readonly KnowledgeKey[];
    readonly types?: readonly KnowledgeLinkType[];
  };
  /** Only items marked Needs Review (true) or only unmarked ones (false). */
  readonly needsReview?: boolean;
};

/** How many items share a Kind, a status and whether they are marked Needs Review. */
export type KnowledgeItemCount = {
  readonly kind: KnowledgeKind;
  readonly status: KnowledgeStatus;
  readonly needsReview: boolean;
  readonly count: number;
};

/** How found items are ordered. */
export const KNOWLEDGE_ITEM_ORDERS = {
  /** By Kind, then by the Knowledge Key's number. */
  byKey: 'by-key',
  /** The most recently recorded first. */
  newestFirst: 'newest-first',
} as const;

export type KnowledgeItemOrder =
  (typeof KNOWLEDGE_ITEM_ORDERS)[keyof typeof KNOWLEDGE_ITEM_ORDERS];

export type KnowledgeItemPage = {
  readonly take: number;
  readonly offset: number;
  /** By Kind and key when left out. */
  readonly order?: KnowledgeItemOrder;
};

/** Exactly one scope, so that a call can never delete every Knowledge Item. */
export type KnowledgeItemDeleteProps =
  { readonly workspaceId: WorkspaceId } | { readonly projectId: ProjectId };

export abstract class KnowledgeItemRepository {
  abstract save(item: KnowledgeItem): Promise<void>;
  abstract findOne(
    props: KnowledgeItemQueryProps,
  ): Promise<KnowledgeItem | null>;
  /** Sorted as the page asks (by Kind, then the Knowledge Key's number, by default); every match without a page. */
  abstract findMany(
    props: KnowledgeItemQueryProps,
    page?: KnowledgeItemPage,
  ): Promise<KnowledgeItem[]>;
  abstract count(props: KnowledgeItemQueryProps): Promise<number>;
  /** The matching items counted by Kind, status and Needs Review; groups with none left out. */
  abstract countGroups(
    props: KnowledgeItemQueryProps,
  ): Promise<KnowledgeItemCount[]>;
  abstract delete(id: KnowledgeItemId): Promise<void>;
  abstract deleteMany(props: KnowledgeItemDeleteProps): Promise<void>;

  public async getOne(props: KnowledgeItemQueryProps): Promise<KnowledgeItem> {
    const item = await this.findOne(props);
    if (!item) {
      throw new KnowledgeItemNotFoundException();
    }

    return item;
  }
}
