import { Injectable } from '@nestjs/common';

import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import type { KnowledgeItem } from '../../domain/entities/index.js';
import { KnowledgeStatus } from '../../domain/value-objects/index.js';
import { toSimilarityFingerprint, toSimilarityText } from '../mappers/index.js';
import {
  KnowledgeEmbedder,
  KnowledgeItemRepository,
  SimilarItemsIndex,
  type SimilarItemsIndexQuery,
} from '../ports/outbound/index.js';

/** The statuses whose items are Similar Items: Rejected and Obsolete are not part of the knowledge. */
const INDEXED: readonly KnowledgeStatus[] = [
  KnowledgeStatus.Draft,
  KnowledgeStatus.Approved,
];

export type SimilarItem = {
  readonly item: KnowledgeItem;
  readonly similarity: number;
};

/**
 * Finds Similar Items. Before every search it brings the Project's index in
 * step with the knowledge: what was recorded or changed since is read anew,
 * what left the knowledge is dropped. Nothing is indexed when knowledge is
 * written, so a write never waits for the model and the index can always be
 * rebuilt from the knowledge alone (Knowledge ADR 0003).
 */
@Injectable()
export class SimilarItemsService {
  /** A Project's index being brought in step, shared by the reads that arrive meanwhile. */
  readonly #indexing = new Map<string, Promise<KnowledgeItem[] | null>>();

  constructor(
    private readonly knowledgeItemRepository: KnowledgeItemRepository,
    private readonly knowledgeEmbedder: KnowledgeEmbedder,
    private readonly similarItemsIndex: SimilarItemsIndex,
  ) {}

  /** The closest first; null while the Workspace has no Provider Key to read meaning with. */
  public async find(
    item: KnowledgeItem,
    take: number,
  ): Promise<SimilarItem[] | null> {
    const current = await this.index(item.workspaceId, item.projectId);
    if (!current) {
      return null;
    }
    const query = await this.queryFor(item, current);
    if (!query) {
      return null;
    }
    const byId = new Map(current.map(found => [found.id.value, found]));
    const matches = await this.similarItemsIndex.nearest(
      item.projectId,
      query,
      take,
    );

    return matches.flatMap(({ itemId, similarity }) => {
      const found = byId.get(itemId.value);

      return found && !found.id.equals(item.id)
        ? [{ item: found, similarity }]
        : [];
    });
  }

  private index(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  ): Promise<KnowledgeItem[] | null> {
    const running = this.#indexing.get(projectId.value);
    if (running) {
      return running;
    }
    const indexing = this.bringInStep(workspaceId, projectId).finally(() =>
      this.#indexing.delete(projectId.value),
    );
    this.#indexing.set(projectId.value, indexing);

    return indexing;
  }

  /** The Project's current items once the index matches them; null when what changed cannot be read for want of a key. */
  private async bringInStep(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  ): Promise<KnowledgeItem[] | null> {
    const items = await this.knowledgeItemRepository.findMany({
      projectId,
      statuses: INDEXED,
    });
    const entries = await this.similarItemsIndex.entries(projectId);
    const fingerprints = new Map(
      entries.map(entry => [entry.itemId.value, entry.fingerprint]),
    );
    const stale = items
      .map(item => {
        const text = toSimilarityText(item);

        return { item, text, fingerprint: toSimilarityFingerprint(text) };
      })
      .filter(
        ({ item, fingerprint }) =>
          fingerprints.get(item.id.value) !== fingerprint,
      );
    if (stale.length > 0) {
      const vectors = await this.knowledgeEmbedder.embed(
        workspaceId,
        stale.map(({ text }) => text),
      );
      if (!vectors) {
        return null;
      }
      await this.similarItemsIndex.upsert(
        workspaceId,
        projectId,
        stale.map(({ item, fingerprint }, index) => ({
          itemId: item.id,
          fingerprint,
          vector: vectors[index]!,
        })),
      );
    }
    const kept = new Set(items.map(item => item.id.value));
    const gone = entries.filter(entry => !kept.has(entry.itemId.value));
    if (gone.length > 0) {
      await this.similarItemsIndex.delete(gone.map(entry => entry.itemId));
    }

    return items;
  }

  /** A current item is looked for by its place in the index; any other is read just now. */
  private async queryFor(
    item: KnowledgeItem,
    current: readonly KnowledgeItem[],
  ): Promise<SimilarItemsIndexQuery | null> {
    if (current.some(found => found.id.equals(item.id))) {
      return { itemId: item.id };
    }
    const vectors = await this.knowledgeEmbedder.embed(item.workspaceId, [
      toSimilarityText(item),
    ]);

    return vectors ? { vector: vectors[0]! } : null;
  }
}
