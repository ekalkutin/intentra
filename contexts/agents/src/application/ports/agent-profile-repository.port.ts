import type { WorkspaceId } from '@intentra/shared';

import type { AgentProfile } from '../../domain/entities/agent-profile.aggregate.js';
import type { AgentProfileId } from '../../domain/value-objects/agent-profile-id.vo.js';

export abstract class AgentProfileRepository {
  abstract save(profile: AgentProfile): Promise<void>;
  abstract findById(
    workspaceId: WorkspaceId,
    id: AgentProfileId,
  ): Promise<AgentProfile | null>;
  /** Profiles of the workspace that are not archived. */
  abstract findActiveByWorkspace(
    workspaceId: WorkspaceId,
  ): Promise<AgentProfile[]>;
}
