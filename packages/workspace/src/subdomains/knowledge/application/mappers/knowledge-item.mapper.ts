import type {
  KnowledgeDependencyDto,
  KnowledgeItemDto,
  KnowledgeKindDto,
  KnowledgeLinkDto,
  KnowledgeSourceDto,
  KnowledgeStatusDto,
} from '@intentra/contracts/workspace';

import type { ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../../domain/entities/index.js';

import { toIsoString } from './instant.mapper.js';
import { toKnowledgeItemAccessDto } from './knowledge-access.mapper.js';

/** What the item's own state does not tell: found by other queries. */
export type KnowledgeItemFindings = {
  /** For an Open Question, the Approved items that answer it. */
  readonly answeredBy?: readonly string[];
  /** Whether anything in its `depends on` cascade is marked; left out in lists. */
  readonly dependencyNeedsReview?: boolean;
};

/** Seen by a Member with the given Project Role, who gets their own `access`. */
export function toKnowledgeItemDto(
  item: KnowledgeItem,
  projectRole: ProjectRole,
  findings: KnowledgeItemFindings = {},
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
    authorId: item.author.memberId?.value ?? null,
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
    links: item.links.map(link => link.toProps() as KnowledgeLinkDto),
    answeredBy: [...(findings.answeredBy ?? [])],
    needsReview: item.needsReview(),
    reviewCauses: item.reviewCauses.map(cause => cause.value),
    dependencyNeedsReview: findings.dependencyNeedsReview ?? null,
    version: item.version.value,
    access: toKnowledgeItemAccessDto(item, projectRole),
  } as KnowledgeItemDto;
}

export function toKnowledgeDependencyDto(
  item: KnowledgeItem,
  projectRole: ProjectRole,
): KnowledgeDependencyDto {
  return {
    key: item.key.value,
    kind: item.kind.value as KnowledgeKindDto,
    title: item.title.value,
    mainField: item.content.mainField.value,
    status: item.status.value as KnowledgeStatusDto,
    needsReview: item.needsReview(),
    version: item.version.value,
    access: toKnowledgeItemAccessDto(item, projectRole),
  };
}
