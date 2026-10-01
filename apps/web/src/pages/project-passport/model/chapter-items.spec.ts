import { describe, expect, it } from 'vitest';

import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import { chapterItems, ITEMS_NAMED } from './chapter-items';
import { PASSPORT_CHAPTERS, type PassportChapter } from './chapters';

function chapterOf(count: number, loaded: number): PassportChapter {
  const items = Array.from(
    { length: loaded },
    (_, index) =>
      ({
        key: `PER-${index + 1}`,
        title: `Персона ${index + 1}`,
      }) as KnowledgeItemDto,
  );
  return {
    id: PASSPORT_CHAPTERS.users,
    groups: [{ kind: 'persona', items, total: count }],
    count,
    mixed: false,
  };
}

describe('chapterItems', () => {
  it('names each item by key and title', () => {
    // Arrange
    const chapter = chapterOf(2, 2);

    // Act
    const { named, rest } = chapterItems(chapter);

    // Assert
    expect(named).toEqual(['PER-1 «Персона 1»', 'PER-2 «Персона 2»']);
    expect(rest).toBe(0);
  });

  it('names only the first ones and counts the rest, loaded or not', () => {
    // Arrange
    const chapter = chapterOf(30, 20);

    // Act
    const { named, rest } = chapterItems(chapter);

    // Assert
    expect(named).toHaveLength(ITEMS_NAMED);
    expect(rest).toBe(30 - ITEMS_NAMED);
  });
});
