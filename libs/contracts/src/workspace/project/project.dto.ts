import { z } from 'zod';

export const ProjectDtoSchema = z.object({
  id: z.string().nonempty(),
  workspaceId: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().optional(),
});

export const CreateProjectDtoSchema = z.object({
  workspaceId: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().optional(),
});

export type ProjectDto = z.infer<typeof ProjectDtoSchema>;
export type CreateProjectDto = z.infer<typeof CreateProjectDtoSchema>;
