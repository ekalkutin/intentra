import { DomainException } from '@intentra/shared';

import type { AgentProfileId } from '../value-objects/agent-profile-id.vo.js';

export class AgentProfileArchivedException extends DomainException<'AGENT_PROFILE_ARCHIVED'> {
  constructor(agentProfileId: AgentProfileId) {
    super(
      `Agent profile ${agentProfileId.value} is archived and cannot be changed`,
      'AGENT_PROFILE_ARCHIVED',
    );
  }
}
