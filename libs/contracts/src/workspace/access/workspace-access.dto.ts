import type { RoleDto } from '../members/member.dto.js';
import type { ProjectRoleDto } from '../project-roles/member-project-role.dto.js';

/** What the calling Member may do in one Project. */
export type ProjectAccessDto = {
  readonly role: ProjectRoleDto;
  readonly canChangeProjectRoles: boolean;
  readonly canDelete: boolean;
};

/**
 * What the calling Member may do in a Workspace, so that the UI offers only
 * what the server will allow. Rules that depend on other Members, such as
 * keeping at least one Owner, can still reject an offered action.
 */
export type WorkspaceAccessDto = {
  readonly memberId: string;
  /** Null for a Member without a Role. */
  readonly role: RoleDto | null;
  readonly canManageInvitations: boolean;
  /** Removing Members and giving or taking away their Roles. */
  readonly canManageMembers: boolean;
  readonly canCreateProjects: boolean;
  readonly canDeleteWorkspace: boolean;
  readonly canSeeAllPersonalAccessTokens: boolean;
  /** Adding, replacing and removing the Provider Key. */
  readonly canManageProviderKey: boolean;
  /** Every Project in the Workspace, by its id. */
  readonly projects: Readonly<Record<string, ProjectAccessDto>>;
};
