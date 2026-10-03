import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import type { KnowledgeItemId } from '../../../domain/value-objects/index.js';

/** What the index holds for one Knowledge Item: which text its vector was read from. */
export type SimilarItemsIndexEntry = {
  readonly itemId: KnowledgeItemId;
  /** A digest of the text the vector was read from; another digest means the vector is stale. */
  readonly fingerprint: string;
};

export type SimilarItemsIndexPoint = SimilarItemsIndexEntry & {
  readonly vector: readonly number[];
};

export type SimilarItemsIndexMatch = {
  readonly itemId: KnowledgeItemId;
  /** Cosine similarity, from 0 (unrelated) to 1 (the same meaning). */
  readonly similarity: number;
};

/** What the nearest items are looked for from: an item already in the index, or a vector read just now. */
export type SimilarItemsIndexQuery =
  { readonly itemId: KnowledgeItemId } | { readonly vector: readonly number[] };

/** Exactly one scope, so that a call can never empty the whole index. */
export type SimilarItemsIndexDeleteProps =
  { readonly workspaceId: WorkspaceId } | { readonly projectId: ProjectId };

/**
 * The vectors of a Project's current Knowledge Items, by which Similar Items
 * are found. It is derived from the knowledge alone and can be rebuilt from it
 * at any time, so it never takes part in a transaction (Knowledge ADR 0003).
 */
export abstract class SimilarItemsIndex {
  abstract entries(projectId: ProjectId): Promise<SimilarItemsIndexEntry[]>;
  abstract upsert(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
    points: readonly SimilarItemsIndexPoint[],
  ): Promise<void>;
  abstract delete(itemIds: readonly KnowledgeItemId[]): Promise<void>;
  /** The closest first, the queried item itself left out. */
  abstract nearest(
    projectId: ProjectId,
    query: SimilarItemsIndexQuery,
    take: number,
  ): Promise<SimilarItemsIndexMatch[]>;
  abstract deleteMany(props: SimilarItemsIndexDeleteProps): Promise<void>;
}
