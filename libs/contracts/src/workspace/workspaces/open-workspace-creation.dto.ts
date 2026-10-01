import { z } from 'zod';

export const OpenWorkspaceCreationDtoSchema = z.object({
  /** Off: only a Platform Admin may create a Workspace; everyone else joins one by Invitation. */
  open: z.boolean(),
});

export type OpenWorkspaceCreationDto = z.infer<
  typeof OpenWorkspaceCreationDtoSchema
>;
