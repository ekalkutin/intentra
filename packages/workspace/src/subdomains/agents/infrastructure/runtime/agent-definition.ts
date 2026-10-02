import type { AgentDefinition } from '@intentra/agent-toolkit';
import type { ReasoningEffortDto } from '@intentra/contracts/workspace';

import type { Agent, AgentsContent } from '../../domain/entities/index.js';
import type { ProviderKeySecret } from '../../domain/value-objects/index.js';

import type { AgentsOptions } from './agents-options.js';

/** An Agent as the runtime builds it, on its Model Profile and the Workspace's Provider Key. */
export function toAgentDefinition(
  options: AgentsOptions,
  agents: AgentsContent,
  agent: Agent,
  providerKey: ProviderKeySecret,
): AgentDefinition {
  const profile = agents.modelProfileOf(agent);
  if (!profile) {
    throw new Error(`${agent.name.value} is on no Model Profile`);
  }

  return {
    name: agent.name.value,
    description: agent.description.value,
    instructions: agent.instructions.value,
    toolIds: agent.tools.map(tool => tool.value),
    skills: agents.skillsOf(agent).map(skill => ({
      name: skill.name.value,
      description: skill.description.value,
      instructions: skill.instructions.value,
    })),
    model: options.model(profile.modelId.value, providerKey.value),
    temperature: profile.temperature?.value ?? null,
    reasoningEffort: (profile.reasoningEffort?.value ??
      null) as ReasoningEffortDto | null,
    maxOutputTokens: profile.maxOutputTokens?.value ?? null,
  };
}
