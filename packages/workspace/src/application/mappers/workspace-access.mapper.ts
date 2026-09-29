import type {
  ProjectAccessDto,
  ProjectRoleDto,
  RoleDto,
  WorkspaceAccessDto,
} from '@intentra/contracts/workspace';

import {
  Member,
  Project,
  ProjectRoleAssignment,
} from '../../domain/entities/index.js';
import {
  AccessPolicyService,
  ProjectRoleResolutionService,
} from '../../domain/services/index.js';

const accessPolicyService = new AccessPolicyService();
const projectRoleResolutionService = new ProjectRoleResolutionService();

export function toWorkspaceAccessDto(
  member: Member,
  projects: readonly Project[],
  assignments: readonly ProjectRoleAssignment[],
): WorkspaceAccessDto {
  return {
    memberId: member.id.value,
    role: (member.role?.value ?? null) as RoleDto | null,
    canManageInvitations: accessPolicyService.canManageInvitations(member),
    canManageMembers: accessPolicyService.canManageMembers(member),
    canCreateProjects: accessPolicyService.canCreateProjects(member),
    canDeleteWorkspace: accessPolicyService.canDeleteWorkspace(member),
    canSeeAllPersonalAccessTokens:
      accessPolicyService.canSeeAllPersonalAccessTokens(member),
    projects: Object.fromEntries(
      projects.map(project => [
        project.id.value,
        toProjectAccessDto(
          member,
          project,
          assignments.find(assignment =>
            assignment.projectId.equals(project.id),
          ) ?? null,
        ),
      ]),
    ),
  };
}

function toProjectAccessDto(
  member: Member,
  project: Project,
  assignment: ProjectRoleAssignment | null,
): ProjectAccessDto {
  return {
    role: projectRoleResolutionService.resolve(member, assignment)
      .value as ProjectRoleDto,
    canChangeProjectRoles: accessPolicyService.canChangeProjectRoles(
      member,
      assignment,
    ),
    canDelete: accessPolicyService.canDeleteProject(member, project),
  };
}
