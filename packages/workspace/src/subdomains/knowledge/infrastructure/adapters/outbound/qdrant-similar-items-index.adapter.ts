import type { QdrantClient } from '@qdrant/js-client-rest';

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

/** How many points one scroll request reads. */
const SCROLL_PAGE = 1000;

/** The fields every point carries besides its vector; the point's id is the Knowledge Item's. */
const PAYLOAD = {
  workspaceId: 'workspaceId',
  projectId: 'projectId',
  fingerprint: 'fingerprint',
} as const;

/**
 * The index in Qdrant: one collection per embedding model, a point per
 * Knowledge Item, searched by cosine within one Project. The collection is
 * created on the first write, sized to the model's vectors.
 */
export class QdrantSimilarItemsIndexAdapter implements SimilarItemsIndex {
  /** Known once the collection is there; until then every read finds nothing. */
  #exists = false;

  constructor(
    private readonly client: QdrantClient,
    private readonly collection: string,
  ) {}

  public async entries(
    projectId: ProjectId,
  ): Promise<SimilarItemsIndexEntry[]> {
    if (!(await this.exists())) {
      return [];
    }
    const entries: SimilarItemsIndexEntry[] = [];
    let offset: string | number | undefined;
    do {
      const page = await this.client.scroll(this.collection, {
        filter: inProject(projectId),
        with_payload: [PAYLOAD.fingerprint],
        with_vector: false,
        limit: SCROLL_PAGE,
        offset,
      });
      for (const point of page.points) {
        entries.push({
          itemId: new KnowledgeItemId(String(point.id)),
          fingerprint: String(point.payload?.[PAYLOAD.fingerprint] ?? ''),
        });
      }
      const next = page.next_page_offset;
      offset =
        typeof next === 'string' || typeof next === 'number' ? next : undefined;
    } while (offset !== undefined);

    return entries;
  }

  public async upsert(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
    points: readonly SimilarItemsIndexPoint[],
  ): Promise<void> {
    if (points.length === 0) {
      return;
    }
    await this.ensureCollection(points[0]!.vector.length);
    await this.client.upsert(this.collection, {
      wait: true,
      points: points.map(point => ({
        id: point.itemId.value,
        vector: [...point.vector],
        payload: {
          [PAYLOAD.workspaceId]: workspaceId.value,
          [PAYLOAD.projectId]: projectId.value,
          [PAYLOAD.fingerprint]: point.fingerprint,
        },
      })),
    });
  }

  public async delete(itemIds: readonly KnowledgeItemId[]): Promise<void> {
    if (itemIds.length === 0 || !(await this.exists())) {
      return;
    }
    await this.client.delete(this.collection, {
      wait: true,
      points: itemIds.map(itemId => itemId.value),
    });
  }

  public async nearest(
    projectId: ProjectId,
    query: SimilarItemsIndexQuery,
    take: number,
  ): Promise<SimilarItemsIndexMatch[]> {
    if (!(await this.exists())) {
      return [];
    }
    const found = await this.client.query(this.collection, {
      query: 'itemId' in query ? query.itemId.value : [...query.vector],
      filter: {
        ...inProject(projectId),
        ...('itemId' in query
          ? { must_not: [{ has_id: [query.itemId.value] }] }
          : {}),
      },
      limit: take,
      with_payload: false,
      with_vector: false,
    });

    return found.points.map(point => ({
      itemId: new KnowledgeItemId(String(point.id)),
      similarity: point.score,
    }));
  }

  public async deleteMany(props: SimilarItemsIndexDeleteProps): Promise<void> {
    if (!(await this.exists())) {
      return;
    }
    await this.client.delete(this.collection, {
      wait: true,
      filter:
        'workspaceId' in props
          ? matching(PAYLOAD.workspaceId, props.workspaceId.value)
          : inProject(props.projectId),
    });
  }

  private async exists(): Promise<boolean> {
    if (!this.#exists) {
      this.#exists = (
        await this.client.collectionExists(this.collection)
      ).exists;
    }

    return this.#exists;
  }

  private async ensureCollection(size: number): Promise<void> {
    if (await this.exists()) {
      return;
    }
    await this.client.createCollection(this.collection, {
      vectors: { size, distance: 'Cosine' },
    });
    for (const field of [PAYLOAD.workspaceId, PAYLOAD.projectId]) {
      await this.client.createPayloadIndex(this.collection, {
        wait: true,
        field_name: field,
        field_schema: 'keyword',
      });
    }
    this.#exists = true;
  }
}

/** The collection for one embedding model, such as `knowledge_items__openai_text_embedding_3_small`. */
export function similarItemsCollection(embeddingModelId: string): string {
  return `knowledge_items__${embeddingModelId.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
}

function inProject(projectId: ProjectId) {
  return matching(PAYLOAD.projectId, projectId.value);
}

function matching(field: string, value: string) {
  return { must: [{ key: field, match: { value } }] };
}
