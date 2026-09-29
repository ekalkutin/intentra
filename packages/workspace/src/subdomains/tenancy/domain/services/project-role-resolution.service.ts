import { Member, ProjectRoleAssignment } from '../entities/index.js';
import { ProjectRole } from '../value-objects/index.js';

export class ProjectRoleResolutionService {
  /**
   * An Owner is a Maintainer in every Project; anyone else holds the assigned
   * Project Role, or is a Viewer without one.
   */
  public resolve(
    member: Member,
    assignment: ProjectRoleAssignment | null,
  ): ProjectRole {
    if (member.isOwner()) {
      return ProjectRole.Maintainer;
    }

    return assignment?.role ?? ProjectRole.Viewer;
  }
}
