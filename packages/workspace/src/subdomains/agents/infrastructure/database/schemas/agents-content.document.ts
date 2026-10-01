import {
  Agent,
  AgentsContent,
  ModelProfile,
  Skill,
} from '../../../domain/entities/index.js';

/** How the Agents, Skills and Model Profiles are stored, inside one document. */
export type AgentsContentDocument = {
  readonly agents: readonly {
    readonly id: string;
    readonly role: string;
    readonly name: string;
    readonly description: string;
    readonly instructions: string;
    readonly tools: readonly string[];
    readonly skillIds: readonly string[];
    readonly modelProfileId: string;
    readonly specialistIds: readonly string[];
  }[];
  readonly skills: readonly {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly instructions: string;
  }[];
  readonly modelProfiles: readonly {
    readonly id: string;
    readonly name: string;
    readonly modelId: string;
    readonly temperature: number | null;
    readonly reasoningEffort: string | null;
    readonly maxOutputTokens: number | null;
  }[];
};

export function toAgentsContentDocument(
  content: AgentsContent,
): AgentsContentDocument {
  return {
    agents: content.agents.map(agent => ({
      id: agent.id.value,
      role: agent.role.value,
      name: agent.name.value,
      description: agent.description.value,
      instructions: agent.instructions.value,
      tools: agent.tools.map(tool => tool.value),
      skillIds: agent.skillIds.map(id => id.value),
      modelProfileId: agent.modelProfileId.value,
      specialistIds: agent.specialistIds.map(id => id.value),
    })),
    skills: content.skills.map(skill => ({
      id: skill.id.value,
      name: skill.name.value,
      description: skill.description.value,
      instructions: skill.instructions.value,
    })),
    modelProfiles: content.modelProfiles.map(profile => ({
      id: profile.id.value,
      name: profile.name.value,
      modelId: profile.modelId.value,
      temperature: profile.temperature?.value ?? null,
      reasoningEffort: profile.reasoningEffort?.value ?? null,
      maxOutputTokens: profile.maxOutputTokens?.value ?? null,
    })),
  };
}

export function toAgentsContent(
  document: AgentsContentDocument,
): AgentsContent {
  return new AgentsContent(
    document.agents.map(agent => Agent.restore(agent)),
    document.skills.map(skill => Skill.restore(skill)),
    document.modelProfiles.map(profile => ModelProfile.restore(profile)),
  );
}
