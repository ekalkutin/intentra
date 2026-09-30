import type {
  KnowledgeItemDto,
  KnowledgeKindDto,
  KnowledgeKindSummaryDto,
} from '@intentra/contracts/workspace';

export type KindSummary = {
  readonly kind: KnowledgeKindDto;
  readonly approved: number;
  readonly drafts: number;
};

export type KnowledgeSummary = {
  /** Every Kind, in the order the model lists them, empty ones included. */
  readonly kinds: KindSummary[];
  readonly approved: number;
  readonly drafts: number;
  /** Drafts and Approved items marked Needs Review. */
  readonly needsReview: number;
  /** The newest Drafts, as the server ordered them. */
  readonly awaitingApproval: readonly KnowledgeItemDto[];
};

/** The overview's counts, from the Project's summary, and the Drafts to show. */
export function summarizeKnowledge(
  kinds: readonly KnowledgeKindSummaryDto[],
  drafts: readonly KnowledgeItemDto[],
): KnowledgeSummary {
  const total = (pick: (kind: KnowledgeKindSummaryDto) => number) =>
    kinds.reduce((sum, kind) => sum + pick(kind), 0);

  return {
    kinds: kinds.map(({ kind, statuses }) => ({
      kind,
      approved: statuses.approved,
      drafts: statuses.draft,
    })),
    approved: total(kind => kind.statuses.approved),
    drafts: total(kind => kind.statuses.draft),
    needsReview: total(kind => kind.needsReview),
    awaitingApproval: drafts,
  };
}
