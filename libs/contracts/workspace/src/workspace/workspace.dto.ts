import { z } from 'zod';

export const WorkspaceDtoSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
});

export const CreateWorkspaceDtoSchema = z.object({
  name: z.string().nonempty(),
});

export type WorkspaceDto = z.infer<typeof WorkspaceDtoSchema>;
export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceDtoSchema>;
