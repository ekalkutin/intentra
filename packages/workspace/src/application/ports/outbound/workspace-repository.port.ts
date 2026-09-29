import type { WorkspaceId } from '@intentra/shared-kernel';

import { Workspace } from '../../../domain/entities/index.js';

export type WorkspaceQueryProps = {
  readonly ids: readonly WorkspaceId[];
};

export abstract class WorkspaceRepository {
  abstract save(workspace: Workspace): Promise<void>;
  abstract delete(id: WorkspaceId): Promise<void>;
  abstract findMany(props: WorkspaceQueryProps): Promise<Workspace[]>;
}
