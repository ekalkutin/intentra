import { z } from 'zod';

const ModelRefDtoSchema = z.object({
  provider: z.string().nonempty(),
  name: z.string().nonempty(),
});

export const AgentProfileDtoSchema = z.object({
  id: z.string().nonempty(),
  workspaceId: z.string().nonempty(),
  name: z.string().nonempty(),
  instructions: z.string().nonempty(),
  model: ModelRefDtoSchema,
  tools: z.array(z.string().nonempty()),
});

// The limits mirror the domain value objects, so a form can show the error
// before the request is sent; the domain still enforces them on its own.
export const CreateAgentProfileDtoSchema = z.object({
  name: z.string().trim().nonempty().max(80),
  instructions: z.string().trim().nonempty().max(20_000),
  model: ModelRefDtoSchema,
  tools: z.array(z.string().nonempty()).optional(),
});

/** Only the fields that change; `tools` replaces the whole list. */
export const UpdateAgentProfileDtoSchema =
  CreateAgentProfileDtoSchema.partial();

export type AgentProfileDto = z.infer<typeof AgentProfileDtoSchema>;
export type CreateAgentProfileDto = z.infer<typeof CreateAgentProfileDtoSchema>;
export type UpdateAgentProfileDto = z.infer<typeof UpdateAgentProfileDtoSchema>;
