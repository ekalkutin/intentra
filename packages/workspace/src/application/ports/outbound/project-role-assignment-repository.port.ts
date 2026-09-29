import type { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { ProjectRoleAssignment } from '../../../domain/entities/index.js';
import type { MemberId } from '../../../domain/value-objects/index.js';

export type ProjectRoleAssignmentQueryProps = {
  readonly projectId: ProjectId;
  readonly memberId?: MemberId;
};

/** Exactly one scope, so that a call can never delete every assignment. */
export type ProjectRoleAssignmentDeleteProps =
  | { readonly workspaceId: WorkspaceId }
  | { readonly projectId: ProjectId }
  | { readonly memberId: MemberId };

export abstract class ProjectRoleAssignmentRepository {
  abstract save(assignment: ProjectRoleAssignment): Promise<void>;
  abstract findOne(
    props: ProjectRoleAssignmentQueryProps,
  ): Promise<ProjectRoleAssignment | null>;
  abstract findMany(
    props: ProjectRoleAssignmentQueryProps,
  ): Promise<ProjectRoleAssignment[]>;
  abstract deleteMany(props: ProjectRoleAssignmentDeleteProps): Promise<void>;
}
