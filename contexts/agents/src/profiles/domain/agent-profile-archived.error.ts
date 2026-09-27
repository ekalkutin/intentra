import type { AgentProfileId } from './value-objects/agent-profile-id.vo.js';

export class AgentProfileArchivedError extends Error {
  constructor(public readonly agentProfileId: AgentProfileId) {
    super(
      `Agent profile ${agentProfileId.value} is archived and cannot be changed`,
    );
    this.name = AgentProfileArchivedError.name;
  }
}
