import { Aggregate, ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import {
  MemberId,
  ProjectRole,
  ProjectRoleAssignmentId,
} from '../value-objects/index.js';

/** The Project Role given to one Member in one Project; without one, the Member is a Viewer there. */
export class ProjectRoleAssignment extends Aggregate<ProjectRoleAssignmentId> {
  readonly #workspaceId: WorkspaceId;
  readonly #projectId: ProjectId;
  readonly #memberId: MemberId;
  #role: ProjectRole;

  private constructor(
    id: ProjectRoleAssignmentId,
    state: ProjectRoleAssignmentState,
  ) {
    super(id);
    this.#workspaceId = state.workspaceId;
    this.#projectId = state.projectId;
    this.#memberId = state.memberId;
    this.#role = state.role;
  }

  get workspaceId(): WorkspaceId {
    return this.#workspaceId;
  }

  get projectId(): ProjectId {
    return this.#projectId;
  }

  get memberId(): MemberId {
    return this.#memberId;
  }

  get role(): ProjectRole {
    return this.#role;
  }

  public static create(
    props: ProjectRoleAssignmentCreateProps,
  ): ProjectRoleAssignment {
    return new ProjectRoleAssignment(new ProjectRoleAssignmentId(), {
      workspaceId: new WorkspaceId(props.workspaceId),
      projectId: new ProjectId(props.projectId),
      memberId: new MemberId(props.memberId),
      role: ProjectRole.from(props.role),
    });
  }

  public static restore(
    props: ProjectRoleAssignmentRestoreProps,
  ): ProjectRoleAssignment {
    return new ProjectRoleAssignment(new ProjectRoleAssignmentId(props.id), {
      workspaceId: new WorkspaceId(props.workspaceId),
      projectId: new ProjectId(props.projectId),
      memberId: new MemberId(props.memberId),
      role: ProjectRole.from(props.role),
    });
  }

  public changeRole(role: ProjectRole): void {
    this.#role = role;
  }
}

type ProjectRoleAssignmentState = {
  readonly workspaceId: WorkspaceId;
  readonly projectId: ProjectId;
  readonly memberId: MemberId;
  readonly role: ProjectRole;
};
type ProjectRoleAssignmentCreateProps = {
  readonly workspaceId: string;
  readonly projectId: string;
  readonly memberId: string;
  readonly role: string;
};
type ProjectRoleAssignmentRestoreProps = {
  readonly id: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly memberId: string;
  readonly role: string;
};
