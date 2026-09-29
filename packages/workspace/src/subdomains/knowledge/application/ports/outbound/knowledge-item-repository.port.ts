import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { KnowledgeItem } from '../../../domain/entities/index.js';
import type {
  KnowledgeItemId,
  KnowledgeKey,
  KnowledgeKind,
  KnowledgeStatus,
} from '../../../domain/value-objects/index.js';
import { KnowledgeItemNotFoundException } from '../../exceptions/index.js';

export type KnowledgeItemQueryProps = {
  readonly projectId: ProjectId;
  readonly key?: KnowledgeKey;
  readonly kind?: KnowledgeKind;
  readonly status?: KnowledgeStatus;
};

export type KnowledgeItemPage = {
  readonly take: number;
  readonly offset: number;
};

/** Exactly one scope, so that a call can never delete every Knowledge Item. */
export type KnowledgeItemDeleteProps =
  { readonly workspaceId: WorkspaceId } | { readonly projectId: ProjectId };

export abstract class KnowledgeItemRepository {
  abstract save(item: KnowledgeItem): Promise<void>;
  abstract findOne(
    props: KnowledgeItemQueryProps,
  ): Promise<KnowledgeItem | null>;
  /** Sorted by Kind, then by the Knowledge Key's number. */
  abstract findMany(
    props: KnowledgeItemQueryProps,
    page: KnowledgeItemPage,
  ): Promise<KnowledgeItem[]>;
  abstract count(props: KnowledgeItemQueryProps): Promise<number>;
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
