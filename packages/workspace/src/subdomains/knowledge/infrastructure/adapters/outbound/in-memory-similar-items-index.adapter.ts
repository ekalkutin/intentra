import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import {
  SimilarItemsIndex,
  type SimilarItemsIndexDeleteProps,
  type SimilarItemsIndexEntry,
  type SimilarItemsIndexMatch,
  type SimilarItemsIndexPoint,
  type SimilarItemsIndexQuery,
} from '../../../application/ports/outbound/index.js';
import { KnowledgeItemId } from '../../../domain/value-objects/index.js';

type StoredPoint = {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly fingerprint: string;
  readonly vector: readonly number[];
};

/**
 * The index in this process's memory, compared item by item: for a server
 * started without Qdrant, and for tests. It is empty after a restart and
 * fills again on the next search.
 */
export class InMemorySimilarItemsIndexAdapter implements SimilarItemsIndex {
  readonly #points = new Map<string, StoredPoint>();

  public async entries(
    projectId: ProjectId,
  ): Promise<SimilarItemsIndexEntry[]> {
    return [...this.#points]
      .filter(([, point]) => point.projectId === projectId.value)
      .map(([itemId, point]) => ({
        itemId: new KnowledgeItemId(itemId),
        fingerprint: point.fingerprint,
      }));
  }

  public async upsert(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
    points: readonly SimilarItemsIndexPoint[],
  ): Promise<void> {
    for (const point of points) {
      this.#points.set(point.itemId.value, {
        workspaceId: workspaceId.value,
        projectId: projectId.value,
        fingerprint: point.fingerprint,
        vector: point.vector,
      });
    }
  }

  public async delete(itemIds: readonly KnowledgeItemId[]): Promise<void> {
    for (const itemId of itemIds) {
      this.#points.delete(itemId.value);
    }
  }

  public async nearest(
    projectId: ProjectId,
    query: SimilarItemsIndexQuery,
    take: number,
  ): Promise<SimilarItemsIndexMatch[]> {
    const queried = 'itemId' in query ? query.itemId.value : null;
    const vector =
      'vector' in query
        ? query.vector
        : this.#points.get(queried ?? '')?.vector;
    if (!vector) {
      return [];
    }

    return [...this.#points]
      .filter(
        ([itemId, point]) =>
          point.projectId === projectId.value && itemId !== queried,
      )
      .map(([itemId, point]) => ({
        itemId: new KnowledgeItemId(itemId),
        similarity: cosine(vector, point.vector),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, take);
  }

  public async deleteMany(props: SimilarItemsIndexDeleteProps): Promise<void> {
    for (const [itemId, point] of this.#points) {
      if (
        'workspaceId' in props
          ? point.workspaceId === props.workspaceId.value
          : point.projectId === props.projectId.value
      ) {
        this.#points.delete(itemId);
      }
    }
  }
}

function cosine(a: readonly number[], b: readonly number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let index = 0; index < a.length; index++) {
    dot += a[index]! * b[index]!;
    normA += a[index]! ** 2;
    normB += b[index]! ** 2;
  }

  return normA === 0 || normB === 0 ? 0 : dot / Math.sqrt(normA * normB);
}
