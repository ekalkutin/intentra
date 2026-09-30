import {
  KnowledgeKindDtoSchema,
  KnowledgeStatusDtoSchema,
  type KnowledgeItemDto,
  type KnowledgeKindDto,
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
  /** Drafts, the most recently recorded first. */
  readonly awaitingApproval: KnowledgeItemDto[];
};

/** Counts a Project's Drafts and Approved items by Kind. */
export function summarizeKnowledge(
  items: readonly KnowledgeItemDto[],
): KnowledgeSummary {
  const drafts = items.filter(
    item => item.status === KnowledgeStatusDtoSchema.enum.draft,
  );
  const approved = items.filter(
    item => item.status === KnowledgeStatusDtoSchema.enum.approved,
  );
  const countOf = (list: readonly KnowledgeItemDto[], kind: KnowledgeKindDto) =>
    list.filter(item => item.kind === kind).length;

  return {
    kinds: KnowledgeKindDtoSchema.options.map(kind => ({
      kind,
      approved: countOf(approved, kind),
      drafts: countOf(drafts, kind),
    })),
    approved: approved.length,
    drafts: drafts.length,
    awaitingApproval: [...drafts].sort((a, b) =>
      b.recordedAt.localeCompare(a.recordedAt),
    ),
  };
}
