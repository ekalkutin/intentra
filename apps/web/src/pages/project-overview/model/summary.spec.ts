import { describe, expect, it } from 'vitest';

import type {
  KnowledgeItemDto,
  KnowledgeKindDto,
  KnowledgeStatusDto,
} from '@intentra/contracts/workspace';

import { summarizeKnowledge } from './summary';

function item(
  key: string,
  kind: KnowledgeKindDto,
  status: KnowledgeStatusDto,
  recordedAt: string,
): KnowledgeItemDto {
  return { key, kind, status, recordedAt } as KnowledgeItemDto;
}

describe('summarizeKnowledge', () => {
  it('counts Drafts and Approved items by Kind, keeping every Kind', () => {
    // Arrange
    const items = [
      item('REQ-1', 'requirement', 'approved', '2026-09-01T10:00:00Z'),
      item('REQ-2', 'requirement', 'draft', '2026-09-02T10:00:00Z'),
      item('TERM-1', 'term', 'draft', '2026-09-03T10:00:00Z'),
    ];

    // Act
    const summary = summarizeKnowledge(items);

    // Assert
    expect(summary.kinds).toHaveLength(11);
    expect(summary.kinds.find(kind => kind.kind === 'requirement')).toEqual({
      kind: 'requirement',
      approved: 1,
      drafts: 1,
    });
    expect(summary.kinds.find(kind => kind.kind === 'goal')).toEqual({
      kind: 'goal',
      approved: 0,
      drafts: 0,
    });
    expect(summary.approved).toBe(1);
    expect(summary.drafts).toBe(2);
  });

  it('lists Drafts awaiting approval, the newest first', () => {
    // Arrange
    const items = [
      item('REQ-2', 'requirement', 'draft', '2026-09-02T10:00:00Z'),
      item('TERM-1', 'term', 'draft', '2026-09-03T10:00:00Z'),
      item('DEC-1', 'decision', 'approved', '2026-09-04T10:00:00Z'),
    ];

    // Act
    const summary = summarizeKnowledge(items);

    // Assert
    expect(summary.awaitingApproval.map(entry => entry.key)).toEqual([
      'TERM-1',
      'REQ-2',
    ]);
  });

  it('leaves out Rejected and Obsolete items', () => {
    // Arrange
    const items = [
      item('REQ-3', 'requirement', 'rejected', '2026-09-02T10:00:00Z'),
      item('REQ-4', 'requirement', 'obsolete', '2026-09-02T10:00:00Z'),
    ];

    // Act
    const summary = summarizeKnowledge(items);

    // Assert
    expect(summary.approved).toBe(0);
    expect(summary.drafts).toBe(0);
    expect(summary.awaitingApproval).toEqual([]);
  });
});
