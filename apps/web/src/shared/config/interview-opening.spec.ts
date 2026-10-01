import { describe, expect, it } from 'vitest';

import { readInterviewOpening } from './routes';

describe('readInterviewOpening', () => {
  it('takes the first message a link carried', () => {
    // Act
    const opening = readInterviewOpening({ opening: 'Давай опишем цели' });

    // Assert
    expect(opening).toBe('Давай опишем цели');
  });

  it('ignores state without one, a blank one, or another shape', () => {
    // Act
    const results = [
      null,
      undefined,
      { opening: '   ' },
      { opening: 42 },
      { listSearch: '?view=all' },
    ].map(readInterviewOpening);

    // Assert
    expect(results).toEqual([null, null, null, null, null]);
  });
});
