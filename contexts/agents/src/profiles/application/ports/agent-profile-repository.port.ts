import type { WorkspaceId } from '@intentra/shared';

import type { AgentProfile } from '../../domain/agent-profile.aggregate.js';
import type { AgentProfileId } from '../../domain/value-objects/agent-profile-id.vo.js';

export abstract class AgentProfileRepository {
  abstract save(profile: AgentProfile): Promise<void>;
  abstract findById(
    workspaceId: WorkspaceId,
    id: AgentProfileId,
  ): Promise<AgentProfile | null>;
  abstract findByWorkspace(workspaceId: WorkspaceId): Promise<AgentProfile[]>;
}
