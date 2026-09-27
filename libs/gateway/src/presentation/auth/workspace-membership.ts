import { Inject, Injectable } from '@nestjs/common';

import { WorkspaceApi } from '@intentra/contracts/workspace';

/**
 * Guards what hangs off a workspace in other contexts (agent profiles): they
 * know the workspace id, but only the Workspace context knows its members.
 */
@Injectable()
export class WorkspaceMembership {
  constructor(
    @Inject(WorkspaceApi)
    private readonly workspace: WorkspaceApi,
  ) {}

  /** Throws `WORKSPACE_NOT_FOUND` (404) when the account is not a member. */
  public async assert(accountId: string, workspaceId: string): Promise<void> {
    await this.workspace.workspaces.getById(accountId, workspaceId);
  }
}
