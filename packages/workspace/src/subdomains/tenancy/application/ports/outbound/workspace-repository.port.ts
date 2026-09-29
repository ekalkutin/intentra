import type { WorkspaceId } from '@intentra/shared-kernel';

import { Workspace } from '../../../domain/entities/index.js';
import { WorkspaceNotFoundException } from '../../exceptions/index.js';

export type WorkspaceQueryProps = {
  readonly id?: WorkspaceId;
  readonly ids?: readonly WorkspaceId[];
};

export abstract class WorkspaceRepository {
  abstract save(workspace: Workspace): Promise<void>;
  abstract delete(id: WorkspaceId): Promise<void>;
  /**
   * Makes two transactions that change the same Workspace conflict, so one of
   * them retries and sees what the other did. Call it first, before reading the
   * acting Member, in any write that adds something under the Workspace or
   * changes its Members, or a concurrent removal could leave it behind.
   */
  abstract lock(id: WorkspaceId): Promise<void>;
  abstract findOne(props: WorkspaceQueryProps): Promise<Workspace | null>;
  abstract findMany(props: WorkspaceQueryProps): Promise<Workspace[]>;

  public async getOne(props: WorkspaceQueryProps): Promise<Workspace> {
    const workspace = await this.findOne(props);
    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }

    return workspace;
  }
}
