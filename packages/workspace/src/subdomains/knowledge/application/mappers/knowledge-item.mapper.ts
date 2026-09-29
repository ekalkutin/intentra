import type {
  KnowledgeItemDto,
  KnowledgeSourceDto,
  KnowledgeStatusDto,
} from '@intentra/contracts/workspace';

import type { ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../../domain/entities/index.js';

import { toIsoString } from './instant.mapper.js';
import { toKnowledgeItemAccessDto } from './knowledge-access.mapper.js';

/** Seen by a Member with the given Project Role, who gets their own `access`. */
export function toKnowledgeItemDto(
  item: KnowledgeItem,
  projectRole: ProjectRole,
): KnowledgeItemDto {
  return {
    id: item.id.value,
    key: item.key.value,
    // The content is always of the item's Kind, and its values are the published ones.
    kind: item.kind.value,
    fields: item.content.toFields(),
    title: item.title.value,
    mainField: item.content.mainField.value,
    status: item.status.value as KnowledgeStatusDto,
    source: item.source.value as KnowledgeSourceDto,
    rationale: item.rationale?.value ?? null,
    authorId: item.authorId.value,
    recordedAt: toIsoString(item.recordedAt),
    lastEditedBy: item.lastEditedBy?.value ?? null,
    lastEditedAt: item.lastEditedAt && toIsoString(item.lastEditedAt),
    approvedBy: item.approvedBy?.value ?? null,
    approvedAt: item.approvedAt && toIsoString(item.approvedAt),
    rejectedBy: item.rejectedBy?.value ?? null,
    rejectedAt: item.rejectedAt && toIsoString(item.rejectedAt),
    rejectionReason: item.rejectionReason?.value ?? null,
    supersedes: item.supersedes?.value ?? null,
    supersededBy: item.supersededBy?.value ?? null,
    supersededAt: item.supersededAt && toIsoString(item.supersededAt),
    supersededByKey: item.supersededByKey?.value ?? null,
    retiredBy: item.retiredBy?.value ?? null,
    retiredAt: item.retiredAt && toIsoString(item.retiredAt),
    retirementReason: item.retirementReason?.value ?? null,
    version: item.version.value,
    access: toKnowledgeItemAccessDto(item, projectRole),
  } as KnowledgeItemDto;
}
