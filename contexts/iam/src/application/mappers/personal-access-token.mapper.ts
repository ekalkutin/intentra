import type { PersonalAccessTokenDto } from '@intentra/contracts/iam';

import type { PersonalAccessToken } from '../../domain/entities/index.js';

export function toPersonalAccessTokenDto(
  token: PersonalAccessToken,
): PersonalAccessTokenDto {
  return {
    id: token.id.value,
    name: token.name.value,
    createdAt: token.createdAt.toString(),
    expiresAt: token.expiresAt?.toString() ?? null,
    revokedAt: token.revokedAt?.toString() ?? null,
  };
}
