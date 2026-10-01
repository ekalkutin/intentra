import {
  KnowledgeKindDtoSchema,
  RequirementFieldsDtoSchema,
  type KnowledgeItemDto,
  type KnowledgeKindDto,
} from '@intentra/contracts/workspace';

const KIND = KnowledgeKindDtoSchema.enum;
const REQUIREMENT_TYPE = RequirementFieldsDtoSchema.shape.type
  .unwrap()
  .unwrap().enum;

/** The Passport's chapters, in reading order (docs/product-documentation-model.md). */
export const PASSPORT_CHAPTERS = {
  overview: 'overview',
  goals: 'goals',
  users: 'users',
  capabilities: 'capabilities',
  rules: 'rules',
  integrations: 'integrations',
  qualities: 'qualities',
  decisions: 'decisions',
} as const;

export type PassportChapterId =
  (typeof PASSPORT_CHAPTERS)[keyof typeof PASSPORT_CHAPTERS];

/** Which Requirements a group holds: the functions, or the qualities. */
export const REQUIREMENT_SORTS = {
  functional: 'functional',
  quality: 'quality',
} as const;

export type RequirementSort =
  (typeof REQUIREMENT_SORTS)[keyof typeof REQUIREMENT_SORTS];

type GroupSource = {
  readonly kind: KnowledgeKindDto;
  /** For Requirements only: which of them the group holds. */
  readonly requirements?: RequirementSort;
};

/** What each chapter is made of, group by group, in the order it reads. */
const CHAPTER_SOURCES: Record<PassportChapterId, readonly GroupSource[]> = {
  overview: [{ kind: KIND['product-overview'] }],
  goals: [{ kind: KIND.goal }],
  users: [{ kind: KIND.persona }],
  capabilities: [
    { kind: KIND.scenario },
    { kind: KIND.requirement, requirements: REQUIREMENT_SORTS.functional },
  ],
  rules: [{ kind: KIND['business-rule'] }, { kind: KIND.term }],
  integrations: [{ kind: KIND.integration }],
  qualities: [
    { kind: KIND.constraint },
    { kind: KIND.requirement, requirements: REQUIREMENT_SORTS.quality },
  ],
  decisions: [{ kind: KIND.decision }, { kind: KIND['open-question'] }],
};

export type PassportGroup = GroupSource & {
  readonly items: readonly KnowledgeItemDto[];
  /** How many Approved items the group holds, loaded or not. */
  readonly total: number;
};

/** How many Approved items each Kind holds, from the Project's summary. */
export type ApprovedTotals = Partial<Record<KnowledgeKindDto, number>>;

export type PassportChapter = {
  readonly id: PassportChapterId;
  /** Its groups with Approved items, empty ones left out. */
  readonly groups: readonly PassportGroup[];
  readonly count: number;
  /** Made of more than one group, so each group needs its own title. */
  readonly mixed: boolean;
};

/** A Requirement with no type counts as a function, the usual case. */
function requirementSortOf(item: KnowledgeItemDto): RequirementSort | null {
  if (item.kind !== KIND.requirement) {
    return null;
  }

  return item.fields.type === REQUIREMENT_TYPE['non-functional']
    ? REQUIREMENT_SORTS.quality
    : REQUIREMENT_SORTS.functional;
}

function belongs(item: KnowledgeItemDto, source: GroupSource): boolean {
  return (
    item.kind === source.kind &&
    (source.requirements === undefined ||
      requirementSortOf(item) === source.requirements)
  );
}

/**
 * Approved items laid out in the Passport's chapters, each keeping the given
 * order. A group's total comes from the summary when the loaded items may be
 * only part of it; Requirements split by type, which the summary does not
 * count, so theirs are what was loaded.
 */
export function layOutPassport(
  items: readonly KnowledgeItemDto[],
  totals: ApprovedTotals = {},
): PassportChapter[] {
  return Object.values(PASSPORT_CHAPTERS).map(id => {
    const groups = CHAPTER_SOURCES[id]
      .map(source => {
        const loaded = items.filter(item => belongs(item, source));
        const counted =
          source.requirements === undefined ? totals[source.kind] : undefined;
        return {
          ...source,
          items: loaded,
          total: Math.max(counted ?? 0, loaded.length),
        };
      })
      .filter(group => group.total > 0);

    return {
      id,
      groups,
      count: groups.reduce((sum, group) => sum + group.total, 0),
      mixed: CHAPTER_SOURCES[id].length > 1,
    };
  });
}
