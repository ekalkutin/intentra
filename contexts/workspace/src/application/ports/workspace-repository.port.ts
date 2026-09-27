import { WorkspaceId } from '@intentra/shared';

import type { Workspace } from '../../domain/workspace/workspace.aggregate.js';

export abstract class WorkspaceRepository {
  abstract save(workspace: Workspace): Promise<void>;
  abstract find(): Promise<Workspace[]>;
  abstract findById(id: WorkspaceId): Promise<Workspace | null>;
}
