import { z } from 'zod';

export const DeleteWorkspaceDtoSchema = z.object({
  slug: z.string(),
});

export type DeleteWorkspaceDto = z.infer<typeof DeleteWorkspaceDtoSchema>;
