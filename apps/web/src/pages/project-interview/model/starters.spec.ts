import { describe, expect, it } from 'vitest';

import {
  KnowledgeKindDtoSchema,
  type KnowledgeKindDto,
  type KnowledgeKindSummaryDto,
} from '@intentra/contracts/workspace';

import { STARTER_REASONS, startersOf } from './starters';

type Counts = {
  approved?: number;
  draft?: number;
  rejected?: number;
  needsReview?: number;
};

function summary(
  counts: Partial<Record<KnowledgeKindDto, Counts>> = {},
): KnowledgeKindSummaryDto[] {
  return KnowledgeKindDtoSchema.options.map(kind => ({
    kind,
    statuses: {
      draft: counts[kind]?.draft ?? 0,
      approved: counts[kind]?.approved ?? 0,
      rejected: counts[kind]?.rejected ?? 0,
      obsolete: 0,
    },
    needsReview: counts[kind]?.needsReview ?? 0,
  }));
}

describe('startersOf', () => {
  it('begins a Project that knows nothing with its product, then its first empty Kinds', () => {
    // Arrange
    const kinds = summary();

    // Act
    const starters = startersOf(kinds, 0);

    // Assert
    expect(starters).toEqual([
      { reason: STARTER_REASONS.fresh, kind: null, count: 0 },
      { reason: STARTER_REASONS.empty, kind: 'goal', count: 0 },
      { reason: STARTER_REASONS.empty, kind: 'persona', count: 0 },
    ]);
  });

  it('puts what needs review, waiting Drafts and open questions before empty Kinds', () => {
    // Arrange
    const kinds = summary({
      'product-overview': { approved: 1 },
      persona: { approved: 1, draft: 6, needsReview: 2 },
      requirement: { draft: 1 },
      'open-question': { draft: 1 },
    });

    // Act
    const starters = startersOf(kinds, 0);

    // Assert
    expect(starters).toEqual([
      { reason: STARTER_REASONS.needsReview, kind: null, count: 2 },
      { reason: STARTER_REASONS.drafts, kind: null, count: 8 },
      {
        reason: STARTER_REASONS.openQuestions,
        kind: 'open-question',
        count: 1,
      },
    ]);
  });

  it('names the first empty Kinds in the model order, leaving rejected items out', () => {
    // Arrange
    const kinds = summary({
      'product-overview': { approved: 1 },
      goal: { approved: 2 },
      persona: { rejected: 3 },
    });

    // Act
    const starters = startersOf(kinds, 0);

    // Assert
    expect(starters.map(starter => starter.kind)).toEqual([
      'persona',
      'scenario',
      'requirement',
    ]);
  });

  it('asks what is missing once every Kind holds something', () => {
    // Arrange
    const everything = Object.fromEntries(
      KnowledgeKindDtoSchema.options
        .filter(kind => kind !== 'open-question')
        .map(kind => [kind, { approved: 1 }]),
    );
    const kinds = summary(everything);

    // Act
    const starters = startersOf(kinds, 0);

    // Assert
    expect(starters).toEqual([
      { reason: STARTER_REASONS.gaps, kind: null, count: 0 },
    ]);
  });

  it('offers the Gaps after open questions, before empty Kinds', () => {
    // Arrange
    const kinds = summary({
      'product-overview': { approved: 1 },
      persona: { approved: 1 },
    });

    // Act
    const starters = startersOf(kinds, 4);

    // Assert
    expect(starters).toEqual([
      { reason: STARTER_REASONS.gaps, kind: null, count: 4 },
      { reason: STARTER_REASONS.empty, kind: 'goal', count: 0 },
      { reason: STARTER_REASONS.empty, kind: 'scenario', count: 0 },
    ]);
  });

  it('leaves the Gaps out of a Project that knows nothing, which begins with its product', () => {
    // Arrange
    const kinds = summary();

    // Act
    const starters = startersOf(kinds, 3);

    // Assert
    expect(starters[0]).toEqual({
      reason: STARTER_REASONS.fresh,
      kind: null,
      count: 0,
    });
    expect(starters.map(starter => starter.reason)).not.toContain(
      STARTER_REASONS.gaps,
    );
  });
});
