import { z } from 'zod';

export const ModelDtoSchema = z.object({
  /** What an agent profile stores, such as `anthropic/claude-sonnet-4.5`. */
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  contextLength: z.int().nonnegative().nullable(),
});

export type ModelDto = z.infer<typeof ModelDtoSchema>;
