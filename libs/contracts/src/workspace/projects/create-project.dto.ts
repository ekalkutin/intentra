import { z } from 'zod';

export const CreateProjectDtoSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export type CreateProjectDto = z.infer<typeof CreateProjectDtoSchema>;
