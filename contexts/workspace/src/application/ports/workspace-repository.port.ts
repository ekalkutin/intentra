import { WorkspaceId } from '@intentra/shared';

import type { Workspace } from '../../domain/entities/workspace.aggregate.js';

export abstract class WorkspaceRepository {
  abstract save(workspace: Workspace): Promise<void>;
  /** Without `ids`, every workspace. */
  abstract find(ids?: WorkspaceId[]): Promise<Workspace[]>;
  abstract findById(id: WorkspaceId): Promise<Workspace | null>;
}
