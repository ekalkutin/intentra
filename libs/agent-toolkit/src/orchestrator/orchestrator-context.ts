import { z } from 'zod';

import { ProjectRoleDtoSchema } from '@intentra/contracts/workspace';

import { toolContextSchema } from '../tool-context.js';

/**
 * The Orchestrator's request context: what its tools read, plus the Project
 * the Conversation takes place in, for its instructions.
 */
export const orchestratorContextSchema = toolContextSchema.extend({
  project: z.object({
    id: z.string(),
    name: z.string(),
    /** The Member's own Project Role, before it is lowered to the Orchestrator's level. */
    role: ProjectRoleDtoSchema,
  }),
});

export type OrchestratorContext = z.infer<typeof orchestratorContextSchema>;
