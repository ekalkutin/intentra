import type {
  KnowledgeGapDto,
  KnowledgeGapRuleDto,
  KnowledgeKindDto,
  KnowledgeStatusDto,
} from '@intentra/contracts/workspace';

import type { KnowledgeItem } from '../../domain/entities/index.js';
import type { KnowledgeGap } from '../../domain/value-objects/index.js';

/** `items` holds the item of every Gap that has one. */
export function toKnowledgeGapDto(
  gap: KnowledgeGap,
  items: readonly KnowledgeItem[],
): KnowledgeGapDto {
  const { key } = gap;
  const item =
    key === null
      ? null
      : (items.find(candidate => candidate.key.equals(key)) ?? null);

  return {
    rule: gap.rule.value as KnowledgeGapRuleDto,
    item: item && {
      key: item.key.value,
      kind: item.kind.value as KnowledgeKindDto,
      title: item.title.value,
      status: item.status.value as KnowledgeStatusDto,
    },
  };
}
