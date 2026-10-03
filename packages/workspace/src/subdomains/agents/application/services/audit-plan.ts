import {
  KnowledgeKindDtoSchema,
  KnowledgeLinkTypeDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

import type { KnowledgeCheck } from '../../domain/value-objects/index.js';
import type { AuditGroup } from '../ports/outbound/index.js';

/** How many Similar Items an item is judged with. */
const SIMILAR_TAKE = 10;

/** The most items around the item under check, so that one call stays small. */
const AROUND_MAX = 20;

export { SIMILAR_TAKE };

/** Whether an Analysis Run looks at the item: a Draft or Approved item, an Open Question aside, which it only reads as already asked. */
export function isAudited(item: KnowledgeItemDto): boolean {
  return (
    item.kind !== KnowledgeKindDtoSchema.enum['open-question'] &&
    (item.status === KnowledgeStatusDtoSchema.enum.draft ||
      item.status === KnowledgeStatusDtoSchema.enum.approved)
  );
}

export function isChecked(
  item: KnowledgeItemDto,
  checks: readonly KnowledgeCheck[],
): boolean {
  return checks.some(check => check.covers(item));
}

/**
 * The item's group: the item, what it links to and what links to it, then
 * its Similar Items, the closest first, as far as room allows; and the Open
 * Questions about any of them.
 */
export function toAuditGroup(
  item: KnowledgeItemDto,
  similarKeys: readonly string[],
  items: readonly KnowledgeItemDto[],
  questions: readonly KnowledgeItemDto[],
): AuditGroup {
  const audited = new Map(
    items.filter(isAudited).map(found => [found.key, found]),
  );
  const linked = [
    ...item.links.map(link => link.key),
    ...items
      .filter(found => found.links.some(link => link.key === item.key))
      .map(found => found.key),
  ];
  const aroundKeys = [...new Set([...linked, ...similarKeys])]
    .filter(key => key !== item.key && audited.has(key))
    .slice(0, AROUND_MAX);
  const keys = new Set([item.key, ...aroundKeys]);

  return {
    item,
    around: aroundKeys.map(key => audited.get(key)!),
    questions: questions.filter(question =>
      question.links.some(
        link =>
          link.type === KnowledgeLinkTypeDtoSchema.enum.concerns &&
          keys.has(link.key),
      ),
    ),
  };
}

/** The keys a finding may concern: the group's, the item under check always among them. */
export function concernedKeys(
  group: AuditGroup,
  concerns: readonly string[],
): string[] {
  const keys = new Set([group.item.key, ...group.around.map(item => item.key)]);

  return [
    ...new Set([group.item.key, ...concerns.filter(key => keys.has(key))]),
  ];
}
