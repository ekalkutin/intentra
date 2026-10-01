import { z } from 'zod';

export const PublishAgentsDtoSchema = z.object({
  /** Why, in a few words; optional. */
  note: z.string().nullable().default(null),
});

export type PublishAgentsDto = z.infer<typeof PublishAgentsDtoSchema>;
