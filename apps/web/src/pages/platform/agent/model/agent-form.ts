import { z } from 'zod';

import type {
  PlatformAgentDto,
  SaveAgentDto,
} from '@intentra/contracts/workspace';

/** The server's limits (the Agents domain's value objects). */
export const AGENT_LIMITS = {
  name: 64,
  description: 1024,
  instructions: 50_000,
} as const;

export const agentFormSchema = z.object({
  name: z.string().trim().min(1).max(AGENT_LIMITS.name),
  description: z.string().trim().min(1).max(AGENT_LIMITS.description),
  instructions: z.string().trim().min(1).max(AGENT_LIMITS.instructions),
  modelProfileId: z.string().min(1),
  tools: z.array(z.string()),
  skillIds: z.array(z.string()),
  specialistIds: z.array(z.string()),
});

export type AgentFormValues = z.infer<typeof agentFormSchema>;

/** What a new Agent starts with: the only Model Profile, when there is one. */
export function emptyAgent(
  modelProfileIds: readonly string[],
): AgentFormValues {
  return {
    name: '',
    description: '',
    instructions: '',
    modelProfileId: modelProfileIds.length === 1 ? modelProfileIds[0]! : '',
    tools: [],
    skillIds: [],
    specialistIds: [],
  };
}

export function agentValues(agent: PlatformAgentDto): AgentFormValues {
  return {
    name: agent.name,
    description: agent.description,
    instructions: agent.instructions,
    modelProfileId: agent.modelProfileId,
    tools: [...agent.tools],
    skillIds: [...agent.skillIds],
    specialistIds: [...agent.specialistIds],
  };
}

/** The form as the API takes it, trimmed; a Specialist never calls other Agents. */
export function toSaveAgentDto(
  values: AgentFormValues,
  isIntentra: boolean,
): SaveAgentDto {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    instructions: values.instructions.trim(),
    modelProfileId: values.modelProfileId,
    tools: values.tools,
    skillIds: values.skillIds,
    specialistIds: isIntentra ? values.specialistIds : [],
  };
}
