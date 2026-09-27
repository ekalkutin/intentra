import type { AccountId, WorkspaceId } from '@intentra/shared';

import type { Workspace } from '../../domain/entities/index.js';
import { WorkspaceNotFoundException } from '../exceptions/index.js';

export abstract class WorkspaceRepository {
  abstract save(workspace: Workspace): Promise<void>;
  /** Without `ids`, every workspace of the member. */
  abstract findByMember(
    member: AccountId,
    ids?: WorkspaceId[],
  ): Promise<Workspace[]>;
  abstract findById(id: WorkspaceId): Promise<Workspace | null>;

  /** Throws `WorkspaceNotFoundException`. */
  public async getById(id: WorkspaceId): Promise<Workspace> {
    const workspace = await this.findById(id);
    if (!workspace) {
      throw new WorkspaceNotFoundException(id.value);
    }
    return workspace;
  }
}
