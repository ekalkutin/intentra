import type {
  KnowledgeKindDto,
  KnowledgeStatusDto,
  KnowledgeSummaryDto,
} from '@intentra/contracts/workspace';

import type { ProjectRole } from '../../../tenancy/index.js';
import {
  KnowledgeKind,
  KnowledgeStatus,
} from '../../domain/value-objects/index.js';
import type { KnowledgeItemCount } from '../ports/outbound/index.js';

import { toKnowledgeAccessDto } from './knowledge-access.mapper.js';

/** Only Drafts and Approved items can be marked Needs Review. */
const MARKABLE: readonly KnowledgeStatus[] = [
  KnowledgeStatus.Draft,
  KnowledgeStatus.Approved,
];

/** Every Kind in the model's order, each with its counts by status; empty ones as zeros. */
export function toKnowledgeSummaryDto(
  counts: readonly KnowledgeItemCount[],
  projectRole: ProjectRole,
): KnowledgeSummaryDto {
  return {
    kinds: KnowledgeKind.all.map(kind => {
      const ofKind = counts.filter(count => count.kind.equals(kind));
      const statuses = Object.fromEntries(
        KnowledgeStatus.all.map(status => [
          status.value,
          sum(ofKind.filter(count => count.status.equals(status))),
        ]),
      ) as Record<KnowledgeStatusDto, number>;

      return {
        kind: kind.value as KnowledgeKindDto,
        statuses,
        needsReview: sum(
          ofKind.filter(
            count =>
              count.needsReview &&
              MARKABLE.some(status => status.equals(count.status)),
          ),
        ),
      };
    }),
    access: toKnowledgeAccessDto(projectRole),
  };
}

function sum(counts: readonly KnowledgeItemCount[]): number {
  return counts.reduce((total, { count }) => total + count, 0);
}
