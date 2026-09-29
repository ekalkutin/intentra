import { z } from 'zod';

export const CreateWorkspaceDtoSchema = z.object({
  name: z.string(),
  slug: z.string(),
});

export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceDtoSchema>;
