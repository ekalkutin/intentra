import { describe, expect, it } from 'vitest';

import { Timestamp } from './timestamp.vo.js';

describe('Timestamp', () => {
  it('goes to a Date and back without losing milliseconds', () => {
    const date = new Date('2026-01-01T10:20:30.456Z');

    expect(Timestamp.fromDate(date).toDate()).toEqual(date);
    expect(Timestamp.fromDate(date).toString()).toBe(
      '2026-01-01T10:20:30.456Z',
    );
  });

  it('adds days as 24 hours and compares', () => {
    const start = Timestamp.from('2026-01-01T00:00:00Z');
    const later = start.addDays(30);

    expect(later.toString()).toBe('2026-01-31T00:00:00.000Z');
    expect(start.isBefore(later)).toBe(true);
    expect(later.isBefore(start)).toBe(false);
    expect(start.equals(Timestamp.from('2026-01-01T00:00:00.000Z'))).toBe(true);
  });
});
