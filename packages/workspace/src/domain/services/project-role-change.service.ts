import { Member, Project, ProjectRoleAssignment } from '../entities/index.js';
import {
  MemberNotActiveException,
  MemberNotInWorkspaceException,
  OwnerProjectRoleFixedException,
  ProjectRoleChangeForbiddenException,
} from '../exceptions/index.js';
import { ProjectRole } from '../value-objects/index.js';

import { AccessPolicyService } from './access-policy.service.js';

export class ProjectRoleChangeService {
  readonly #accessPolicyService = new AccessPolicyService();

  /** An Owner or a Maintainer of the Project gives an Active Member a Project Role. */
  public change(
    project: Project,
    changer: Member,
    member: Member,
    props: ProjectRoleChangeProps,
  ): ProjectRoleAssignment {
    this.ensureActiveIn(project, changer);
    if (
      !this.#accessPolicyService.canChangeProjectRoles(
        changer,
        props.changerAssignment,
      )
    ) {
      throw new ProjectRoleChangeForbiddenException();
    }
    this.ensureActiveIn(project, member);
    if (member.isOwner()) {
      throw new OwnerProjectRoleFixedException();
    }

    if (props.assignment) {
      props.assignment.changeRole(props.role);

      return props.assignment;
    }

    return ProjectRoleAssignment.create({
      workspaceId: project.workspaceId.value,
      projectId: project.id.value,
      memberId: member.id.value,
      role: props.role.value,
    });
  }

  private ensureActiveIn(project: Project, member: Member): void {
    if (!member.belongsTo(project.workspaceId)) {
      throw new MemberNotInWorkspaceException();
    }
    if (!member.isActive()) {
      throw new MemberNotActiveException();
    }
  }
}

type ProjectRoleChangeProps = {
  readonly role: ProjectRole;
  /** The changer's own assignment in the Project, if any. */
  readonly changerAssignment: ProjectRoleAssignment | null;
  /** The Member's current assignment in the Project, if any. */
  readonly assignment: ProjectRoleAssignment | null;
};
