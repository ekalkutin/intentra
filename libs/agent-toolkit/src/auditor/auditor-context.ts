import { z } from 'zod';

import { toolContextSchema } from '../tool-context.js';

/**
 * The Auditor's request context: what its tools read, the caller being
 * Intentra itself, plus the Project it looks over, for its instructions.
 */
export const auditorContextSchema = toolContextSchema.extend({
  project: z.object({ id: z.string(), name: z.string() }),
});

export type AuditorContext = z.infer<typeof auditorContextSchema>;
