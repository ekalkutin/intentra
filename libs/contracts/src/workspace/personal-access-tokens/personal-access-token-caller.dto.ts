import type { Actor } from '../../iam/index.js';
import type { ProjectRoleDto } from '../project-roles/member-project-role.dto.js';

/** Who an external agent acts for, as read from a Personal Access Token. */
export type PersonalAccessTokenCallerDto = {
  readonly actor: Actor;
  readonly workspaceId: string;
  /** The token's level; in each Project the agent gets the lower of it and the Member's Project Role. */
  readonly level: ProjectRoleDto;
};
