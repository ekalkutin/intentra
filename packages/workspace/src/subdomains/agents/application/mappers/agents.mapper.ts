import type {
  AgentRoleDto,
  AgentsChangeDto,
  AgentsChangeKindDto,
  AgentsChangesDto,
  AgentsContentDto,
  AgentsVersionDto,
  AgentsVersionSummaryDto,
  AgentToolDto,
  ModelProfileDto,
  PlatformAgentDto,
  PublishingProblemCodeDto,
  PublishingProblemDto,
  ReasoningEffortDto,
  SaveAgentDto,
  SaveModelProfileDto,
  SaveSkillDto,
  SkillDto,
  UnpublishedAgentsDto,
} from '@intentra/contracts/workspace';

import {
  Agent,
  AgentsContent,
  AgentsVersion,
  ModelProfile,
  Skill,
  UnpublishedAgents,
  type AgentsChange,
  type AgentsChanges,
  type AgentSpec,
  type ModelProfileSpec,
  type SkillSpec,
} from '../../domain/entities/index.js';
import {
  AgentDescription,
  AgentId,
  AgentInstructions,
  AgentName,
  MaxOutputTokens,
  ModelId,
  ModelProfileId,
  ModelProfileName,
  ReasoningEffort,
  SkillDescription,
  SkillId,
  SkillInstructions,
  SkillName,
  Temperature,
  ToolName,
  type PublishingProblem,
} from '../../domain/value-objects/index.js';
import type { CatalogTool } from '../ports/outbound/index.js';

import { toIsoString } from './instant.mapper.js';

export function toAgentSpec(data: SaveAgentDto): AgentSpec {
  return {
    name: new AgentName(data.name),
    description: new AgentDescription(data.description),
    instructions: new AgentInstructions(data.instructions),
    tools: data.tools.map(tool => new ToolName(tool)),
    skillIds: data.skillIds.map(id => new SkillId(id)),
    modelProfileId: new ModelProfileId(data.modelProfileId),
    specialistIds: data.specialistIds.map(id => new AgentId(id)),
  };
}

export function toSkillSpec(data: SaveSkillDto): SkillSpec {
  return {
    name: new SkillName(data.name),
    description: new SkillDescription(data.description),
    instructions: new SkillInstructions(data.instructions),
  };
}

export function toModelProfileSpec(
  data: SaveModelProfileDto,
): ModelProfileSpec {
  return {
    name: new ModelProfileName(data.name),
    modelId: new ModelId(data.modelId),
    temperature:
      data.temperature === null ? null : new Temperature(data.temperature),
    reasoningEffort:
      data.reasoningEffort === null
        ? null
        : ReasoningEffort.from(data.reasoningEffort),
    maxOutputTokens:
      data.maxOutputTokens === null
        ? null
        : new MaxOutputTokens(data.maxOutputTokens),
  };
}

export function toPlatformAgentDto(agent: Agent): PlatformAgentDto {
  return {
    id: agent.id.value,
    role: agent.role.value as AgentRoleDto,
    name: agent.name.value,
    description: agent.description.value,
    instructions: agent.instructions.value,
    tools: agent.tools.map(tool => tool.value),
    skillIds: agent.skillIds.map(id => id.value),
    modelProfileId: agent.modelProfileId.value,
    specialistIds: agent.specialistIds.map(id => id.value),
  };
}

export function toSkillDto(skill: Skill): SkillDto {
  return {
    id: skill.id.value,
    name: skill.name.value,
    description: skill.description.value,
    instructions: skill.instructions.value,
  };
}

export function toModelProfileDto(profile: ModelProfile): ModelProfileDto {
  return {
    id: profile.id.value,
    name: profile.name.value,
    modelId: profile.modelId.value,
    temperature: profile.temperature?.value ?? null,
    reasoningEffort: (profile.reasoningEffort?.value ??
      null) as ReasoningEffortDto | null,
    maxOutputTokens: profile.maxOutputTokens?.value ?? null,
  };
}

export function toAgentsContentDto(content: AgentsContent): AgentsContentDto {
  return {
    agents: content.agents.map(toPlatformAgentDto),
    skills: content.skills.map(toSkillDto),
    modelProfiles: content.modelProfiles.map(toModelProfileDto),
  };
}

/** `published` is null until the first publishing. */
export function toUnpublishedAgentsDto(
  unpublished: UnpublishedAgents,
  published: AgentsVersion | null,
): UnpublishedAgentsDto {
  return {
    publishedNumber: published?.number.value ?? null,
    content: toAgentsContentDto(unpublished.content),
  };
}

export function toAgentsVersionSummaryDto(
  version: AgentsVersion,
): AgentsVersionSummaryDto {
  return {
    number: version.number.value,
    note: version.note?.value ?? null,
    publishedByEmail: version.publisher.email.value,
    publishedAt: toIsoString(version.publishedAt),
  };
}

export function toAgentsVersionDto(version: AgentsVersion): AgentsVersionDto {
  return {
    ...toAgentsVersionSummaryDto(version),
    content: toAgentsContentDto(version.content),
  };
}

export function toAgentsChangesDto(
  changes: AgentsChanges,
  problems: readonly PublishingProblem[],
): AgentsChangesDto {
  return {
    agents: changes.agents.map(toAgentsChangeDto),
    skills: changes.skills.map(toAgentsChangeDto),
    modelProfiles: changes.modelProfiles.map(toAgentsChangeDto),
    problems: problems.map(toPublishingProblemDto),
  };
}

function toPublishingProblemDto(
  problem: PublishingProblem,
): PublishingProblemDto {
  return {
    code: problem.kind.value as PublishingProblemCodeDto,
    subject: problem.subject,
    tool: problem.tool,
  };
}

function toAgentsChangeDto(change: AgentsChange): AgentsChangeDto {
  return {
    id: change.id,
    name: change.name,
    kind: change.kind.value as AgentsChangeKindDto,
    fields: change.fields,
  };
}

export function toAgentToolDto(tool: CatalogTool): AgentToolDto {
  return {
    id: tool.name.value,
    description: tool.description,
    readOnly: tool.readOnly,
  };
}
