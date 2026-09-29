import {
  Member,
  PersonalAccessToken,
  Project,
  ProjectRoleAssignment,
} from '../entities/index.js';
import { ProjectRole } from '../value-objects/index.js';

import { ProjectRoleResolutionService } from './project-role-resolution.service.js';

/**
 * The one place that says what a Member may do. Domain services ask it before
 * acting, and the same answers are shown to the Member, so the UI offers only
 * what the server will allow. Rules that depend on other Members, such as
 * keeping at least one Owner, stay with the operation.
 */
export class AccessPolicyService {
  readonly #projectRoleResolutionService = new ProjectRoleResolutionService();

  public canManageInvitations(member: Member): boolean {
    return member.isOwner();
  }

  /** Removing Members and giving or taking away their Roles. */
  public canManageMembers(member: Member): boolean {
    return member.isOwner();
  }

  public canCreateProjects(member: Member): boolean {
    return member.isOwner() || member.isManager();
  }

  public canDeleteProject(member: Member, project: Project): boolean {
    return (
      member.isOwner() || (member.isManager() && project.isCreatedBy(member.id))
    );
  }

  public canChangeProjectRoles(
    member: Member,
    assignment: ProjectRoleAssignment | null,
  ): boolean {
    return this.#projectRoleResolutionService
      .resolve(member, assignment)
      .equals(ProjectRole.Maintainer);
  }

  public canDeleteWorkspace(member: Member): boolean {
    return member.isOwner();
  }

  public canSeeAllPersonalAccessTokens(member: Member): boolean {
    return member.isOwner();
  }

  public canRevokePersonalAccessToken(
    member: Member,
    token: PersonalAccessToken,
  ): boolean {
    return member.isOwner() || token.isCreatedBy(member.id);
  }
}
