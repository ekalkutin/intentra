import { describe, expect, it } from 'vitest';

import { neighboursOf } from './neighbours';

describe('neighboursOf', () => {
  it('gives the keys around one in the list and its position', () => {
    // Act
    const neighbours = neighboursOf(['A-1', 'A-2', 'A-3'], 'A-2');

    // Assert
    expect(neighbours).toEqual({
      previous: 'A-1',
      next: 'A-3',
      position: 2,
      total: 3,
    });
  });

  it('has no neighbours at the ends or for a key not in the list', () => {
    // Act
    const first = neighboursOf(['A-1', 'A-2'], 'A-1');
    const missing = neighboursOf(['A-1', 'A-2'], 'B-1');

    // Assert
    expect(first.previous).toBeNull();
    expect(missing).toEqual({
      previous: null,
      next: null,
      position: null,
      total: 2,
    });
  });
});
