import type {
  MemberProjectRoleDto,
  ProjectRoleDto,
} from '@intentra/contracts/workspace';

import { Member } from '../../domain/entities/index.js';
import { ProjectRole } from '../../domain/value-objects/index.js';

export function toMemberProjectRoleDto(
  member: Member,
  role: ProjectRole,
): MemberProjectRoleDto {
  return {
    memberId: member.id.value,
    email: member.email.value,
    role: role.value as ProjectRoleDto,
  };
}
