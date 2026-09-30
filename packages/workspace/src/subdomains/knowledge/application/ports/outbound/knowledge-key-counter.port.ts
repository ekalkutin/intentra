import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import type { KnowledgeKind } from '../../../domain/value-objects/index.js';

import type { KnowledgeItemDeleteProps } from './knowledge-item-repository.port.js';

/** Hands out Knowledge Key numbers, counted per Kind within a Project. */
export abstract class KnowledgeKeyCounter {
  /** The next number, taken inside the caller's transaction: a rolled-back recording gives it back. */
  abstract next(props: {
    readonly workspaceId: WorkspaceId;
    readonly projectId: ProjectId;
    readonly kind: KnowledgeKind;
  }): Promise<number>;
  abstract deleteMany(props: KnowledgeItemDeleteProps): Promise<void>;
}
