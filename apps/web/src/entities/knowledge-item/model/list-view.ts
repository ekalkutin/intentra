import {
  KnowledgeKindDtoSchema,
  KnowledgeListOrderDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
  type KnowledgeKindDto,
  type KnowledgeKindSummaryDto,
  type KnowledgeListOrderDto,
  type ListKnowledgeItemsDto,
} from '@intentra/contracts/workspace';

/** The parts of a Project's knowledge the list shows, one per tab. */
export const KNOWLEDGE_VIEWS = {
  /** Every item, whatever its status. */
  all: 'all',
  approved: 'approved',
  drafts: 'drafts',
  /** Marked Needs Review. */
  review: 'review',
  rejected: 'rejected',
  obsolete: 'obsolete',
} as const;

export type KnowledgeView =
  (typeof KNOWLEDGE_VIEWS)[keyof typeof KNOWLEDGE_VIEWS];

/** The most items one list reads; the server's own limit. */
export const KNOWLEDGE_LIST_SIZE = 200;

const { draft, approved, rejected, obsolete } = KnowledgeStatusDtoSchema.enum;

const FILTERS = {
  all: { statuses: [draft, approved, rejected, obsolete] },
  approved: { statuses: [approved] },
  drafts: { statuses: [draft] },
  review: { statuses: [draft, approved], needsReview: true },
  rejected: { statuses: [rejected] },
  obsolete: { statuses: [obsolete] },
} as const satisfies Record<KnowledgeView, Partial<ListKnowledgeItemsDto>>;

/** What the list reads for a view and a Kind (every Kind when null). */
export function knowledgeFilter(
  view: KnowledgeView,
  kind: KnowledgeKindDto | null,
  order: KnowledgeListOrderDto = KnowledgeListOrderDtoSchema.enum['by-key'],
): Partial<ListKnowledgeItemsDto> {
  const filter = FILTERS[view];

  return {
    ...filter,
    statuses: [...filter.statuses],
    ...(kind ? { kind } : {}),
    ...(order === KnowledgeListOrderDtoSchema.enum['by-key'] ? {} : { order }),
    take: KNOWLEDGE_LIST_SIZE,
  };
}

/** The order named in the address, or by Knowledge Key. */
export function parseKnowledgeOrder(
  value: string | null,
): KnowledgeListOrderDto {
  const parsed = KnowledgeListOrderDtoSchema.safeParse(value);
  return parsed.success
    ? parsed.data
    : KnowledgeListOrderDtoSchema.enum['by-key'];
}

/** The view named in the address, or every item. */
export function parseKnowledgeView(value: string | null): KnowledgeView {
  const views: readonly string[] = Object.values(KNOWLEDGE_VIEWS);

  return value && views.includes(value)
    ? (value as KnowledgeView)
    : KNOWLEDGE_VIEWS.all;
}

/** The Kind named in the address, or null for every Kind. */
export function parseKnowledgeKind(
  value: string | null,
): KnowledgeKindDto | null {
  const parsed = KnowledgeKindDtoSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}

export type KindGroup = {
  readonly kind: KnowledgeKindDto;
  readonly items: KnowledgeItemDto[];
};

/**
 * Items under their Kinds, the Kinds in the model's order (Product Overview
 * first), each keeping the server's order by Knowledge Key; empty Kinds left out.
 */
export function groupByKind(items: readonly KnowledgeItemDto[]): KindGroup[] {
  return KnowledgeKindDtoSchema.options
    .map(kind => ({ kind, items: items.filter(item => item.kind === kind) }))
    .filter(group => group.items.length > 0);
}

/** The items in the order the list shows them. */
export function inListOrder(
  items: readonly KnowledgeItemDto[],
): KnowledgeItemDto[] {
  return groupByKind(items).flatMap(group => group.items);
}

/** What a list row hands the item page, so it can step through the same list and lead back to it. */
export type KnowledgeListState = { readonly listSearch: string };

/** The list state a page was opened with, if it came from the list. */
export function readKnowledgeListState(
  state: unknown,
): KnowledgeListState | null {
  return typeof state === 'object' &&
    state !== null &&
    'listSearch' in state &&
    typeof state.listSearch === 'string'
    ? { listSearch: state.listSearch }
    : null;
}

/** How many items a view holds within one Kind, from the Project's summary. */
export function viewCount(
  summary: KnowledgeKindSummaryDto,
  view: KnowledgeView,
): number {
  const { draft, approved, rejected, obsolete } = summary.statuses;
  const counts: Record<KnowledgeView, number> = {
    all: draft + approved + rejected + obsolete,
    approved,
    drafts: draft,
    review: summary.needsReview,
    rejected,
    obsolete,
  };

  return counts[view];
}

/** How many items a view holds, in one Kind or (null) in every Kind. */
export function viewTotal(
  kinds: readonly KnowledgeKindSummaryDto[],
  view: KnowledgeView,
  kind: KnowledgeKindDto | null,
): number {
  return kinds
    .filter(summary => kind === null || summary.kind === kind)
    .reduce((total, summary) => total + viewCount(summary, view), 0);
}
