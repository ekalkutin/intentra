import { z } from 'zod';

export const AgentToolDtoSchema = z.object({
  id: z.string().nonempty(),
  description: z.string().nonempty(),
});

export type AgentToolDto = z.infer<typeof AgentToolDtoSchema>;
