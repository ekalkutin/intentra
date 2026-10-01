import { z } from 'zod';

import { ReasoningEffortDtoSchema } from './agents-content.dto.js';

export const SaveModelProfileDtoSchema = z.object({
  name: z.string(),
  modelId: z.string(),
  temperature: z.number().nullable().default(null),
  reasoningEffort: ReasoningEffortDtoSchema.nullable().default(null),
  maxOutputTokens: z.number().int().nullable().default(null),
});

export type SaveModelProfileDto = z.infer<typeof SaveModelProfileDtoSchema>;
