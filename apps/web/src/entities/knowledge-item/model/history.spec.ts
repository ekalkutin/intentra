import { describe, expect, it } from 'vitest';

import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import { historyOf } from './history';

describe('historyOf', () => {
  it('lists what happened to the item, oldest first, leaving out what did not', () => {
    // Arrange
    const item = {
      authorId: 'author',
      recordedAt: '2026-09-01T10:00:00Z',
      lastEditedBy: 'editor',
      lastEditedAt: '2026-09-02T10:00:00Z',
      approvedBy: 'maintainer',
      approvedAt: '2026-09-03T10:00:00Z',
      rejectedBy: null,
      rejectedAt: null,
      supersededBy: 'maintainer',
      supersededAt: '2026-09-05T10:00:00Z',
      retiredBy: null,
      retiredAt: null,
    } as KnowledgeItemDto;

    // Act
    const history = historyOf(item);

    // Assert
    expect(history).toEqual([
      { type: 'recorded', memberId: 'author', at: '2026-09-01T10:00:00Z' },
      { type: 'edited', memberId: 'editor', at: '2026-09-02T10:00:00Z' },
      { type: 'approved', memberId: 'maintainer', at: '2026-09-03T10:00:00Z' },
      {
        type: 'superseded',
        memberId: 'maintainer',
        at: '2026-09-05T10:00:00Z',
      },
    ]);
  });
});
