import { z } from 'zod';

export const DeleteProjectDtoSchema = z.object({
  slug: z.string(),
});

export type DeleteProjectDto = z.infer<typeof DeleteProjectDtoSchema>;
