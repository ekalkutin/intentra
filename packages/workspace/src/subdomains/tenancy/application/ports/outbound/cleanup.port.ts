import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import type { MemberId } from '../../../domain/value-objects/index.js';

/**
 * Told that a Workspace or Project was deleted, or a Member removed, it removes
 * everything that lies under it, in every subdomain, Tenancy's own data
 * included. The caller changes the root first and calls this inside the same
 * transaction, so nothing is left behind
 * (docs/adr/0001-knowledge-and-agents-are-subdomains-of-workspace.md).
 */
export abstract class Cleanup {
  abstract afterWorkspaceDeleted(workspaceId: WorkspaceId): Promise<void>;
  abstract afterProjectDeleted(projectId: ProjectId): Promise<void>;
  abstract afterMemberRemoved(memberId: MemberId): Promise<void>;
}
