import { z } from 'zod';

import type { Actor } from '../auth/actor.js';

/** The signed-in Account, its name read anew rather than from the access token. */
export type MeDto = Actor;

export const EditMeDtoSchema = z.object({
  name: z.string(),
});

export type EditMeDto = z.infer<typeof EditMeDtoSchema>;
