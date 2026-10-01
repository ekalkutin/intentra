import {
  KnowledgeKindDtoSchema,
  type KnowledgeKindDto,
  type KnowledgeKindSummaryDto,
} from '@intentra/contracts/workspace';

/** Why a starter is offered, which also picks its words. */
export const STARTER_REASONS = {
  /** Nothing is known yet: begin with the product. */
  fresh: 'fresh',
  needsReview: 'needsReview',
  drafts: 'drafts',
  openQuestions: 'openQuestions',
  /** A Kind nothing is known of. */
  empty: 'empty',
  /** Every Kind holds something: ask the agent what is missing. */
  gaps: 'gaps',
} as const;

export type StarterReason =
  (typeof STARTER_REASONS)[keyof typeof STARTER_REASONS];

export type Starter = {
  readonly reason: StarterReason;
  /** The Kind it is about, if one. */
  readonly kind: KnowledgeKindDto | null;
  readonly count: number;
};

/** How many starters an empty Conversation offers. */
export const STARTERS_SHOWN = 3;

const KINDS = KnowledgeKindDtoSchema.enum;

/** What a Kind holds that still counts: Approved and Drafts. */
export function knownOf(entry: KnowledgeKindSummaryDto): number {
  return entry.statuses.approved + entry.statuses.draft;
}

/**
 * The ways to begin, most pressing first: what needs review, Drafts waiting
 * for approval, open questions, then the Kinds nothing is known of in the
 * model's order. A Project that knows nothing begins with its product.
 */
export function startersOf(
  kinds: readonly KnowledgeKindSummaryDto[],
): Starter[] {
  const sum = (count: (entry: KnowledgeKindSummaryDto) => number) =>
    kinds.reduce((total, entry) => total + count(entry), 0);
  const starters: Starter[] = [];
  const fresh = sum(knownOf) === 0;

  if (fresh) {
    starters.push({ reason: STARTER_REASONS.fresh, kind: null, count: 0 });
  }
  const needsReview = sum(entry => entry.needsReview);
  if (needsReview > 0) {
    starters.push({
      reason: STARTER_REASONS.needsReview,
      kind: null,
      count: needsReview,
    });
  }
  const drafts = sum(entry => entry.statuses.draft);
  if (drafts > 0) {
    starters.push({
      reason: STARTER_REASONS.drafts,
      kind: null,
      count: drafts,
    });
  }
  const questions = kinds.find(entry => entry.kind === KINDS['open-question']);
  if (questions && knownOf(questions) > 0) {
    starters.push({
      reason: STARTER_REASONS.openQuestions,
      kind: questions.kind,
      count: knownOf(questions),
    });
  }
  for (const entry of kinds) {
    if (
      knownOf(entry) === 0 &&
      entry.kind !== KINDS['open-question'] &&
      // The product is what a fresh Project begins with anyway.
      !(fresh && entry.kind === KINDS['product-overview'])
    ) {
      starters.push({
        reason: STARTER_REASONS.empty,
        kind: entry.kind,
        count: 0,
      });
    }
  }
  if (starters.length < STARTERS_SHOWN) {
    starters.push({ reason: STARTER_REASONS.gaps, kind: null, count: 0 });
  }

  return starters.slice(0, STARTERS_SHOWN);
}
