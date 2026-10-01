import { describe, expect, it } from 'vitest';

import { whenActive } from './when';

const NOW = new Date('2026-10-01T15:00:00');

describe('whenActive', () => {
  it('gives the time for today', () => {
    // Act
    const when = whenActive('2026-10-01T09:05:00', 'en-GB', NOW);

    // Assert
    expect(when).toBe('09:05');
  });

  it('gives the date for an earlier day this year', () => {
    // Act
    const when = whenActive('2026-09-28T09:05:00', 'en-GB', NOW);

    // Assert
    expect(when).toBe('28 Sept');
  });

  it('adds the year for an earlier year', () => {
    // Act
    const when = whenActive('2025-09-28T09:05:00', 'en-GB', NOW);

    // Assert
    expect(when).toBe('28 Sept 2025');
  });
});
