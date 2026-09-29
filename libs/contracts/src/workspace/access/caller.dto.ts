import type { Actor } from '../../iam/index.js';
import type { ProjectRoleDto } from '../project-roles/member-project-role.dto.js';

/** An external agent working for the Actor with a Personal Access Token. */
export type AgentDto = {
  /** The token's level; in each Project the agent gets the lower of it and the Member's Project Role. */
  readonly level: ProjectRoleDto;
};

/** Who calls: a person, or an external agent working for them. */
export type CallerDto = {
  readonly actor: Actor;
  /** Null for a person working in the web UI. */
  readonly agent: AgentDto | null;
};
