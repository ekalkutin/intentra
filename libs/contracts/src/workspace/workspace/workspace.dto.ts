import { z } from 'zod';

/** Lower-case words joined by single hyphens: `acme-labs`. */
export const WORKSPACE_ALIAS_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const WORKSPACE_ALIAS_MIN_LENGTH = 3;
export const WORKSPACE_ALIAS_MAX_LENGTH = 40;
/** The alias is the first URL segment, so it cannot shadow the app's own routes. */
export const WORKSPACE_RESERVED_ALIASES: readonly string[] = [
  'api',
  'auth',
  'onboarding',
  'workspaces',
];

/** Unique across Intentra; `WORKSPACE_ALIAS_ALREADY_TAKEN` (409) otherwise. */
const WorkspaceAliasSchema = z
  .string()
  .min(WORKSPACE_ALIAS_MIN_LENGTH)
  .max(WORKSPACE_ALIAS_MAX_LENGTH)
  .regex(WORKSPACE_ALIAS_PATTERN, {
    error: 'Use lowercase letters, digits and single hyphens.',
  })
  .refine(alias => !WORKSPACE_RESERVED_ALIASES.includes(alias), {
    error: 'This alias is reserved.',
  });

export const WorkspaceDtoSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  alias: WorkspaceAliasSchema,
});

export const CreateWorkspaceDtoSchema = z.object({
  name: z.string().nonempty(),
  alias: WorkspaceAliasSchema,
});

/** Without `ids`, every workspace of the account. */
export const FindWorkspacesDtoSchema = z.object({
  ids: z.array(z.string().nonempty()).optional(),
});

export type WorkspaceDto = z.infer<typeof WorkspaceDtoSchema>;
export type CreateWorkspaceDto = z.infer<typeof CreateWorkspaceDtoSchema>;
export type FindWorkspacesDto = z.infer<typeof FindWorkspacesDtoSchema>;
