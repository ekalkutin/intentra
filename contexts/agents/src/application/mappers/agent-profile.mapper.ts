import type { AgentProfileDto } from '@intentra/contracts/agents';

import type { AgentProfile } from '../../domain/entities/index.js';

export function toAgentProfileDto(profile: AgentProfile): AgentProfileDto {
  return {
    id: profile.id.value,
    workspaceId: profile.workspaceId.value,
    name: profile.name.value,
    instructions: profile.instructions.value,
    model: {
      provider: profile.model.provider,
      name: profile.model.name,
    },
    tools: profile.tools.map(tool => tool.value),
  };
}
