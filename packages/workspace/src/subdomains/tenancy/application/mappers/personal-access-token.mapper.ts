import type {
  PersonalAccessTokenDto,
  ProjectRoleDto,
} from '@intentra/contracts/workspace';

import { Member, PersonalAccessToken } from '../../domain/entities/index.js';

import { toIsoString } from './instant.mapper.js';

export function toPersonalAccessTokenDto(
  token: PersonalAccessToken,
  member: Member,
): PersonalAccessTokenDto {
  return {
    id: token.id.value,
    name: token.name.value,
    secretHint: token.secretHint.value,
    level: token.level.value as ProjectRoleDto,
    memberId: token.memberId.value,
    memberEmail: member.email.value,
    memberName: member.name.value,
    createdAt: toIsoString(token.createdAt),
    expiresAt: token.expiresAt && toIsoString(token.expiresAt),
    lastUsedAt: token.lastUsedAt && toIsoString(token.lastUsedAt),
  };
}
