import { describe, expect, it } from 'vitest';

import { loadedParts, pageLength } from './loaded-parts';

describe('pageLength', () => {
  it('holds a full page, then what is left, then nothing', () => {
    // Act
    const lengths = [0, 1, 2, 3].map(index => pageLength(120, index));

    // Assert
    expect(lengths).toEqual([50, 50, 20, 0]);
  });
});

describe('loadedParts', () => {
  it('remembers the groups seen and the pages loaded', () => {
    // Act
    loadedParts.markSeen('p1:current:term');
    loadedParts.setPages('p1:current:term', 3);

    // Assert
    expect(loadedParts.wasSeen('p1:current:term')).toBe(true);
    expect(loadedParts.pages('p1:current:term')).toBe(3);
    expect(loadedParts.pages('p1:current:goal')).toBe(1);
  });
});
