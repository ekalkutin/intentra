import { z } from 'zod';

const name = z
  .string()
  .trim()
  .min(1, 'Укажите название')
  .max(80, 'Название не длиннее 80 символов');

export const CreateProjectSchema = z.object({ name });
export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

export const ProjectSchema = z.object({
  id: z.uuid(),
  workspaceId: z.uuid(),
  name: z.string(),
  createdAt: z.iso.datetime(),
});
export type ProjectDto = z.infer<typeof ProjectSchema>;
