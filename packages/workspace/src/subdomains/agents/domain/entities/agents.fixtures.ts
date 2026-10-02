import {
  AgentDescription,
  AgentInstructions,
  AgentName,
  AgentRole,
  ModelId,
  ModelProfileName,
  SkillDescription,
  SkillInstructions,
  SkillName,
  ToolName,
  UnpublishedAgentsId,
  type ModelProfileId,
} from '../value-objects/index.js';

import type { Agent, AgentSpec } from './agent.entity.js';
import type { AgentsContent } from './agents-content.js';
import type { ModelProfileSpec } from './model-profile.entity.js';
import type { SkillSpec } from './skill.entity.js';
import { UnpublishedAgents } from './unpublished-agents.aggregate.js';

/** The tools the code offers in these tests. */
export const TOOLS = [
  new ToolName('list_knowledge'),
  new ToolName('record_goal'),
];

export function profileSpec(name = 'Default'): ModelProfileSpec {
  return {
    name: new ModelProfileName(name),
    modelId: new ModelId('openrouter/anthropic/claude-sonnet-5'),
    temperature: null,
    reasoningEffort: null,
    maxOutputTokens: null,
  };
}

export function skillSpec(name = 'intentra-interviewing'): SkillSpec {
  return {
    name: new SkillName(name),
    description: new SkillDescription('When interviewing a person'),
    instructions: new SkillInstructions('Ask one question at a time.'),
  };
}

export function agentSpec(
  modelProfileId: ModelProfileId,
  overrides: Partial<AgentSpec> = {},
): AgentSpec {
  return {
    name: new AgentName('Researcher'),
    description: new AgentDescription('Digs into requirements'),
    instructions: new AgentInstructions('Find the gaps.'),
    tools: [TOOLS[0]!],
    skillIds: [],
    modelProfileId,
    specialistIds: [],
    ...overrides,
  };
}

/** Unpublished Agents holding Intentra on one Model Profile, the least that can be published. */
export function unpublishedWithIntentra(): UnpublishedAgents {
  const unpublished = UnpublishedAgents.empty();
  const profile = unpublished.addModelProfile(profileSpec());
  unpublished.addAgent(
    AgentRole.Intentra,
    agentSpec(profile.id, { name: new AgentName('Intentra') }),
    TOOLS,
  );

  return unpublished;
}

/** Another Unpublished Agents holding the same content, such as after publishing it. */
export function unpublishedFrom(content: AgentsContent): UnpublishedAgents {
  return UnpublishedAgents.restore({
    id: new UnpublishedAgentsId().value,
    content,
  });
}

export function intentraOf(content: AgentsContent): Agent {
  return content.agents.find(agent => agent.isIntentra())!;
}
