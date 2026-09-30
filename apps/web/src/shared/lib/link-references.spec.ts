import { describe, expect, it } from 'vitest';

import { linkReferences } from './link-references';

const KEY = /\b(?:REQ|TERM)-\d+\b/g;
const toHref = (key: string) => `#ref:${key}`;

describe('linkReferences', () => {
  it('links the references in plain text', () => {
    // Act
    const text = linkReferences('See REQ-1 and TERM-2.', KEY, toHref);

    // Assert
    expect(text).toBe('See [REQ-1](#ref:REQ-1) and [TERM-2](#ref:TERM-2).');
  });

  it('leaves code, fenced code and links as they are', () => {
    // Arrange
    const source = [
      'Run `REQ-1` or',
      '```',
      'REQ-2',
      '```',
      '[the spec of REQ-3](https://example.com/REQ-3) and ![REQ-4](img.png)',
    ].join('\n');

    // Act
    const text = linkReferences(source, KEY, toHref);

    // Assert
    expect(text).toBe(source);
  });

  it('leaves bare URLs and autolinks as they are, linking what is around them', () => {
    // Act
    const text = linkReferences(
      'Tracked at https://tracker.example/REQ-5 and <https://x.example/TERM-6>, see REQ-7',
      KEY,
      toHref,
    );

    // Assert
    expect(text).toBe(
      'Tracked at https://tracker.example/REQ-5 and <https://x.example/TERM-6>, see [REQ-7](#ref:REQ-7)',
    );
  });
});
