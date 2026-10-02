import {
  KnowledgeKindDtoSchema,
  KnowledgeLinkTypeDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
} from '@intentra/contracts/workspace';

const CURRENT: readonly string[] = [
  KnowledgeStatusDtoSchema.enum.draft,
  KnowledgeStatusDtoSchema.enum.approved,
];

/**
 * The Open Questions still open about each item, by the item's Knowledge
 * Key: current ones (Draft or Approved) that no Approved item answers, read
 * from their `concerns` Links.
 */
export function openQuestionsByKey(
  items: readonly KnowledgeItemDto[],
): Map<string, KnowledgeItemDto[]> {
  const byKey = new Map<string, KnowledgeItemDto[]>();
  for (const question of items) {
    if (
      question.kind !== KnowledgeKindDtoSchema.enum['open-question'] ||
      !CURRENT.includes(question.status) ||
      question.answeredBy.length > 0
    ) {
      continue;
    }
    for (const link of question.links) {
      if (link.type === KnowledgeLinkTypeDtoSchema.enum.concerns) {
        byKey.set(link.key, [...(byKey.get(link.key) ?? []), question]);
      }
    }
  }

  return byKey;
}
