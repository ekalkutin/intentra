import { z } from 'zod';

export const SaveSkillDtoSchema = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.string(),
});

export type SaveSkillDto = z.infer<typeof SaveSkillDtoSchema>;
