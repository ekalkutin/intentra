import { describe, expect, it } from 'vitest';

import { untilNext } from './analysis-scheduler.js';

const HOUR = 60 * 60 * 1000;

describe('untilNext', () => {
  it('waits for the hour later today', () => {
    // Arrange
    const now = Date.UTC(2026, 9, 3, 22, 30);

    // Act
    const wait = untilNext(23, now);

    // Assert
    expect(wait).toBe(HOUR / 2);
  });

  it('waits for tomorrow once the hour has come', () => {
    // Arrange
    const now = Date.UTC(2026, 9, 3, 0, 0);

    // Act
    const wait = untilNext(0, now);

    // Assert
    expect(wait).toBe(24 * HOUR);
  });
});
