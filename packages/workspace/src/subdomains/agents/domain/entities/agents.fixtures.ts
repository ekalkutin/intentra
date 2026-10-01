import {
  AgentDescription,
  AgentId,
  AgentInstructions,
  AgentName,
  AgentRole,
  AgentsVersionNumber,
  ModelId,
  ModelProfileId,
  ModelProfileName,
  SkillDescription,
  SkillInstructions,
  SkillName,
  ToolName,
} from '../value-objects/index.js';

import { Agent, type AgentSpec } from './agent.entity.js';
import { AgentsContent } from './agents-content.js';
import { ModelProfile, type ModelProfileSpec } from './model-profile.entity.js';
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
    name: new AgentName('Analyst'),
    description: new AgentDescription('Digs into requirements'),
    instructions: new AgentInstructions('Find the gaps.'),
    tools: [TOOLS[0]!],
    skillIds: [],
    modelProfileId,
    specialistIds: [],
    ...overrides,
  };
}

/** Agents Version 1's content: an Orchestrator on one Model Profile. */
export function firstContent(): AgentsContent {
  const profile = ModelProfile.create(new ModelProfileId(), profileSpec());
  const orchestrator = Agent.create(
    new AgentId(),
    AgentRole.Orchestrator,
    agentSpec(profile.id, { name: new AgentName('Orchestrator') }),
  );

  return new AgentsContent([orchestrator], [], [profile]);
}

export function unpublishedFrom(content: AgentsContent): UnpublishedAgents {
  return UnpublishedAgents.startFrom(content, AgentsVersionNumber.First);
}

export function orchestratorOf(content: AgentsContent): Agent {
  return content.agents.find(agent => agent.isOrchestrator())!;
}
