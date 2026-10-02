import { z } from 'zod';

import { AgentRoleDtoSchema } from './agents-content.dto.js';

/** An Agent's content; its role is set when it is created and never changes. */
export const SaveAgentDtoSchema = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.string(),
  tools: z.array(z.string()),
  skillIds: z.array(z.string()),
  modelProfileId: z.string(),
  specialistIds: z.array(z.string()).default([]),
});

export type SaveAgentDto = z.infer<typeof SaveAgentDtoSchema>;

/** A new Agent: any number of Specialists, but only one Intentra. */
export const CreateAgentDtoSchema = SaveAgentDtoSchema.extend({
  role: AgentRoleDtoSchema,
});

export type CreateAgentDto = z.infer<typeof CreateAgentDtoSchema>;
