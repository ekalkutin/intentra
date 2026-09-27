import { z } from 'zod';

export const WorkspaceDtoSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
});

export const CreateWorkspaceDtoSchema = z.object({
  name: z.string().nonempty(),
});

/** Without `ids`, every workspace. */
export const FindWorkspacesDtoSchema = z.object({
  ids: z.array(z.string().nonempty()).optional(),
});

export type WorkspaceDto = z.infer<typeof WorkspaceDtoSchema>;
export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceDtoSchema>;
export type FindWorkspacesDto = z.infer<typeof FindWorkspacesDtoSchema>;
