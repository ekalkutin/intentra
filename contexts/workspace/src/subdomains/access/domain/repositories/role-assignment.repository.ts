import { RoleAssignment } from '../entities/index.js';

export abstract class RoleAssignmentRepository {
  abstract save(assignment: RoleAssignment): Promise<void>;
  /** Всё, что выдано этому человеку в этом workspace, на всех областях сразу. */
  abstract findMany(
    workspaceId: string,
    accountId: string,
  ): Promise<RoleAssignment[]>;
}
