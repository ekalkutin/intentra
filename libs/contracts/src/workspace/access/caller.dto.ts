import { z } from 'zod';

import type { Actor } from '../../iam/index.js';
import type { ProjectRoleDto } from '../project-roles/member-project-role.dto.js';

/** Which agent calls: an external one over MCP, or one of Intentra's own Agents. */
export const AgentKindDtoSchema = z.enum(['external', 'intentra']);

export type AgentKindDto = z.infer<typeof AgentKindDtoSchema>;

/** An agent working for the Actor, limited further than the Actor is. */
export type AgentDto = {
  readonly kind: AgentKindDto;
  /** In each Project the agent gets the lower of it and the Member's Project Role. */
  readonly level: ProjectRoleDto;
  /** The one Project the agent may reach; null for every Project of the Workspace. */
  readonly projectId: string | null;
};

/** Who calls: a person, or an agent working for them. */
export type CallerDto = {
  readonly actor: Actor;
  /** Null for a person working in the web UI. */
  readonly agent: AgentDto | null;
};
