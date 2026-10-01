import { z } from 'zod';

/** A Specialist to add, or an Agent's new content. Its role never changes. */
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
