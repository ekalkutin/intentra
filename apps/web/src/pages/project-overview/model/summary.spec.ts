import { describe, expect, it } from 'vitest';

import type {
  KnowledgeItemDto,
  KnowledgeKindSummaryDto,
} from '@intentra/contracts/workspace';

import { summarizeKnowledge } from './summary';

function kind(
  name: KnowledgeKindSummaryDto['kind'],
  draft: number,
  approved: number,
  needsReview = 0,
): KnowledgeKindSummaryDto {
  return {
    kind: name,
    statuses: { draft, approved, rejected: 3, obsolete: 4 },
    needsReview,
  };
}

function draft(key: string, recordedAt: string): KnowledgeItemDto {
  return { key, recordedAt } as KnowledgeItemDto;
}

describe('summarizeKnowledge', () => {
  it('counts Drafts, Approved items and marks by Kind and in all, leaving out Rejected and Obsolete', () => {
    // Arrange
    const kinds = [
      kind('requirement', 1, 1, 1),
      kind('goal', 0, 0),
      kind('term', 1, 0),
    ];

    // Act
    const summary = summarizeKnowledge(kinds, []);

    // Assert
    expect(summary.kinds).toEqual([
      { kind: 'requirement', approved: 1, drafts: 1 },
      { kind: 'goal', approved: 0, drafts: 0 },
      { kind: 'term', approved: 0, drafts: 1 },
    ]);
    expect(summary.approved).toBe(1);
    expect(summary.drafts).toBe(2);
    expect(summary.needsReview).toBe(1);
  });

  it('keeps the Drafts awaiting approval in the order the server gave', () => {
    // Arrange
    const drafts = [
      draft('TERM-1', '2026-09-03T10:00:00Z'),
      draft('REQ-2', '2026-09-02T10:00:00Z'),
    ];

    // Act
    const summary = summarizeKnowledge([], drafts);

    // Assert
    expect(summary.awaitingApproval.map(entry => entry.key)).toEqual([
      'TERM-1',
      'REQ-2',
    ]);
  });
});
