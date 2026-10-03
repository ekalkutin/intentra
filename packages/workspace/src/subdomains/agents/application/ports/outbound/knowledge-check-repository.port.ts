import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import type { KnowledgeCheck } from '../../../domain/value-objects/index.js';

/** The last check of each Knowledge Item of a Project, one per Knowledge Key. */
export abstract class KnowledgeCheckRepository {
  /** Replaces the item's earlier check, if any. */
  abstract save(
    workspaceId: WorkspaceId,
    projectId: ProjectId,
    check: KnowledgeCheck,
  ): Promise<void>;
  abstract findMany(props: {
    readonly projectId: ProjectId;
  }): Promise<KnowledgeCheck[]>;
  abstract deleteMany(
    props:
      { readonly workspaceId: WorkspaceId } | { readonly projectId: ProjectId },
  ): Promise<void>;
}
