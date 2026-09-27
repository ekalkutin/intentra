import { z } from 'zod';

export const AGENT_ROLE = {
  /** The one agent per workspace that talks to people and delegates. */
  ORCHESTRATOR: 'orchestrator',
  /** An agent the workspace creates; only the orchestrator delegates to it. */
  SPECIALIST: 'specialist',
} as const;

export const AgentRoleSchema = z.enum([
  AGENT_ROLE.ORCHESTRATOR,
  AGENT_ROLE.SPECIALIST,
]);

/** An OpenRouter model id, such as `anthropic/claude-sonnet-4.5`. */
export const ModelIdSchema = z
  .string()
  .trim()
  .regex(/^\S+\/\S+$/)
  .max(200);

export const AgentProfileDtoSchema = z.object({
  id: z.string().nonempty(),
  workspaceId: z.string().nonempty(),
  role: AgentRoleSchema,
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  instructions: z.string().nonempty(),
  model: z.string().nonempty(),
  tools: z.array(z.string().nonempty()),
});

// The limits mirror the domain value objects, so a form can show the error
// before the request is sent; the domain still enforces them on its own.
export const CreateAgentProfileDtoSchema = z.object({
  name: z.string().trim().nonempty().max(80),
  description: z.string().trim().nonempty().max(1000),
  instructions: z.string().trim().nonempty().max(20_000),
  model: ModelIdSchema,
  tools: z.array(z.string().nonempty()).optional(),
});

/** Only the fields that change; `tools` replaces the whole list. */
export const UpdateAgentProfileDtoSchema =
  CreateAgentProfileDtoSchema.partial();

export type AgentRole = z.infer<typeof AgentRoleSchema>;
export type AgentProfileDto = z.infer<typeof AgentProfileDtoSchema>;
export type CreateAgentProfileDto = z.infer<typeof CreateAgentProfileDtoSchema>;
export type UpdateAgentProfileDto = z.infer<typeof UpdateAgentProfileDtoSchema>;
