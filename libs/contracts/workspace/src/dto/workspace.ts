import { z } from 'zod';

const name = z
  .string()
  .trim()
  .min(1, 'Укажите название')
  .max(80, 'Название не длиннее 80 символов');

export const CreateWorkspaceSchema = z.object({ name });
export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceSchema>;

export const WorkspaceSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  createdAt: z.iso.datetime(),
});
export type WorkspaceDto = z.infer<typeof WorkspaceSchema>;
