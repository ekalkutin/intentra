import type { Actor } from '../../iam/index.js';
import type { DeleteWorkspaceDto } from '../workspaces/delete-workspace.dto.js';

import type { PlatformWorkspaceDto } from './platform-workspace.dto.js';

/** Workspaces across the platform, for a Platform Admin only (403 `NOT_PLATFORM_ADMIN`). */
export abstract class PlatformWorkspacesApi {
  /** By name. */
  abstract list(actor: Actor): Promise<PlatformWorkspaceDto[]>;

  /** Nothing in it can be changed and no AI works with it until it is resumed. */
  abstract suspend(actor: Actor, workspaceId: string): Promise<void>;

  abstract resume(actor: Actor, workspaceId: string): Promise<void>;

  /** With everything in it, after the slug is typed to confirm (400 `WORKSPACE_SLUG_MISMATCH`). */
  abstract delete(
    actor: Actor,
    workspaceId: string,
    data: DeleteWorkspaceDto,
  ): Promise<void>;

  /**
   * Revokes the Personal Access Tokens of the Account's Members in every
   * Workspace, for good; called once IAM has blocked the Account.
   */
  abstract revokeAccountTokens(actor: Actor, accountId: string): Promise<void>;
}
