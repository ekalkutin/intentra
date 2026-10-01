import { describe, expect, it } from 'vitest';

import { PRIORITY_LEVELS, priorityOf } from './priority';

describe('priorityOf', () => {
  it("reads a Requirement's priority", () => {
    // Act
    const priority = priorityOf('requirement', 'priority', 'must');

    // Assert
    expect(priority).toBe('must');
  });

  it('leaves out other choices and Kinds', () => {
    // Act
    const results = [
      priorityOf('requirement', 'type', 'functional'),
      priorityOf('goal', 'priority', 'must'),
      priorityOf('requirement', 'priority', 'wont'),
    ];

    // Assert
    expect(results).toEqual([null, null, null]);
  });

  it('fills more bars the more it matters', () => {
    // Act
    const levels = [
      PRIORITY_LEVELS.must,
      PRIORITY_LEVELS.should,
      PRIORITY_LEVELS.could,
    ];

    // Assert
    expect(levels).toEqual([3, 2, 1]);
  });
});
