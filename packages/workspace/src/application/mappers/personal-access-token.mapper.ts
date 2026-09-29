import type {
  PersonalAccessTokenDto,
  ProjectRoleDto,
} from '@intentra/contracts/workspace';

import { Member, PersonalAccessToken } from '../../domain/entities/index.js';

/** Mongo keeps milliseconds: a date must read the same before and after a round trip. */
const ISO_MILLISECONDS: Temporal.InstantToStringOptions = {
  smallestUnit: 'millisecond',
};

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
    createdAt: token.createdAt.toString(ISO_MILLISECONDS),
    expiresAt: token.expiresAt?.toString(ISO_MILLISECONDS) ?? null,
    lastUsedAt: token.lastUsedAt?.toString(ISO_MILLISECONDS) ?? null,
  };
}
