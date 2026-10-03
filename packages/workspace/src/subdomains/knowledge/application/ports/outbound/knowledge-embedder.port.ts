import type { WorkspaceId } from '@intentra/shared-kernel';

/** Reads the meaning of texts as vectors, on the Workspace's Provider Key and at its cost. */
export abstract class KnowledgeEmbedder {
  /** One vector per text, in order; null while the Workspace has no Provider Key. */
  abstract embed(
    workspaceId: WorkspaceId,
    texts: readonly string[],
  ): Promise<number[][] | null>;
}
