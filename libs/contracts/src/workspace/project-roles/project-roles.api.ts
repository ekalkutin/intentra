import type { Actor } from '../../iam/index.js';

import type { ChangeProjectRoleDto } from './change-project-role.dto.js';
import type { MemberProjectRoleDto } from './member-project-role.dto.js';

export abstract class ProjectRolesApi {
  /** Every Active Member of the Workspace with their Project Role. */
  abstract list(
    actor: Actor,
    workspaceId: string,
    projectId: string,
  ): Promise<MemberProjectRoleDto[]>;

  abstract change(
    actor: Actor,
    workspaceId: string,
    projectId: string,
    memberId: string,
    data: ChangeProjectRoleDto,
  ): Promise<MemberProjectRoleDto>;
}
