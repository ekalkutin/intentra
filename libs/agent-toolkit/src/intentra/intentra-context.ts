import { z } from 'zod';

import { ProjectRoleDtoSchema } from '@intentra/contracts/workspace';

import { toolContextSchema } from '../tool-context.js';

/**
 * Intentra's request context: what its tools read, plus the Project
 * the Conversation takes place in, for its instructions.
 */
export const intentraContextSchema = toolContextSchema.extend({
  project: z.object({
    id: z.string(),
    name: z.string(),
    /** The Member's own Project Role, before it is lowered to Intentra's level. */
    role: ProjectRoleDtoSchema,
  }),
});

export type IntentraContext = z.infer<typeof intentraContextSchema>;
