import type { ProviderKeyDto } from '@intentra/contracts/workspace';

import type { Member } from '../../../tenancy/index.js';
import type { ProviderKey } from '../../domain/entities/index.js';

import { toIsoString } from './instant.mapper.js';

/** `addedBy` is null once the Member who added the key has left. */
export function toProviderKeyDto(
  key: ProviderKey,
  addedBy: Member | null,
): ProviderKeyDto {
  return {
    hint: key.hint.value,
    addedByMemberId: key.addedBy.value,
    addedByEmail: addedBy?.email.value ?? null,
    addedByName: addedBy?.name.value ?? null,
    addedAt: toIsoString(key.addedAt),
  };
}
