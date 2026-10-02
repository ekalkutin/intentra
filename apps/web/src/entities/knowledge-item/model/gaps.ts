import {
  KnowledgeGapRuleDtoSchema,
  type KnowledgeGapDto,
  type KnowledgeGapRuleDto,
  type KnowledgeKindDto,
} from '@intentra/contracts/workspace';

export type GapGroup = {
  readonly rule: KnowledgeGapRuleDto;
  readonly gaps: KnowledgeGapDto[];
};

/**
 * Gaps under their rules, in the server's order of rules; those of one Kind
 * when asked (then the Project's own Gaps are left out); empty rules left out.
 */
export function groupGapsByRule(
  gaps: readonly KnowledgeGapDto[],
  kind: KnowledgeKindDto | null,
): GapGroup[] {
  const shown = gaps.filter(gap => kind === null || gap.item?.kind === kind);

  return KnowledgeGapRuleDtoSchema.options
    .map(rule => ({ rule, gaps: shown.filter(gap => gap.rule === rule) }))
    .filter(group => group.gaps.length > 0);
}

/** The rules an item misses, in the server's order. */
export function gapRulesOf(
  gaps: readonly KnowledgeGapDto[],
  key: string,
): KnowledgeGapRuleDto[] {
  return gaps.filter(gap => gap.item?.key === key).map(gap => gap.rule);
}

/** The Knowledge Keys the Gaps view shows, each once, in its order. */
export function gapKeys(
  gaps: readonly KnowledgeGapDto[],
  kind: KnowledgeKindDto | null,
): string[] {
  const keys = groupGapsByRule(gaps, kind).flatMap(group =>
    group.gaps.flatMap(gap => (gap.item ? [gap.item.key] : [])),
  );

  return [...new Set(keys)];
}
