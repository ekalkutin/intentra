import { z } from 'zod';

import type { Actor } from '../../iam/index.js';
import {
  ProjectRoleDtoSchema,
  type ProjectRoleDto,
} from '../project-roles/member-project-role.dto.js';

/**
 * Which agent calls: an external one over MCP, one of Intentra's own Agents
 * in a Conversation, or Intentra itself in an Analysis Run.
 */
export const AgentKindDtoSchema = z.enum([
  'external',
  'intentra',
  'analysis-run',
]);

export type AgentKindDto = z.infer<typeof AgentKindDtoSchema>;

/** An agent working for the Actor, limited further than the Actor is. */
export type AgentDto = {
  readonly kind: AgentKindDto;
  /** In each Project the agent gets the lower of it and the Member's Project Role. */
  readonly level: ProjectRoleDto;
  /** The one Project the agent may reach; null for every Project of the Workspace. */
  readonly projectId: string | null;
};

/** A person, or an agent working for them. */
export type MemberCallerDto = {
  readonly actor: Actor;
  /** Null for a person working in the web UI. */
  readonly agent: AgentDto | null;
};

/**
 * Intentra itself, in an Analysis Run: no person behind it, a Contributor in
 * one Project that reads its knowledge and records Open Questions, nothing
 * else.
 */
export type IntentraCallerDto = {
  readonly actor: null;
  readonly agent: {
    readonly kind: (typeof AgentKindDtoSchema.enum)['analysis-run'];
    readonly level: typeof ProjectRoleDtoSchema.enum.contributor;
    readonly projectId: string;
  };
};

/** Who calls. */
export type CallerDto = MemberCallerDto | IntentraCallerDto;

/** Intentra itself calling in an Analysis Run of the Project. */
export function intentraCaller(projectId: string): IntentraCallerDto {
  return {
    actor: null,
    agent: {
      kind: AgentKindDtoSchema.enum['analysis-run'],
      level: ProjectRoleDtoSchema.enum.contributor,
      projectId,
    },
  };
}
