import type { MemberDto, RoleDto } from '@intentra/contracts/workspace';

import { Member } from '../../domain/entities/index.js';

export function toMemberDto(member: Member): MemberDto {
  return {
    id: member.id.value,
    email: member.email.value,
    name: member.name.value,
    role: (member.role?.value ?? null) as RoleDto | null,
  };
}
