import type { MemberDto, RoleDto } from '@intentra/contracts/workspace';

import { Member, Workspace } from '../../domain/entities/index.js';

export function toMemberDto(member: Member, workspace: Workspace): MemberDto {
  return {
    id: member.id.value,
    email: member.email.value,
    role: member.role.value as RoleDto,
    isOwner: workspace.isOwnedBy(member.id),
  };
}
