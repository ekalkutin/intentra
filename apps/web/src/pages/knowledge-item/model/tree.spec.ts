import { describe, expect, it } from 'vitest';

import type { KnowledgeDependencyDto } from '@intentra/contracts/workspace';

import { dependencyTree } from './tree';

const item = (key: string) => ({ key }) as KnowledgeDependencyDto;

describe('dependencyTree', () => {
  it('indents the cascade under the item, expanding each item once', () => {
    // Arrange
    const dependencies = {
      items: [item('REQ-2'), item('REQ-1'), item('PER-1')],
      dependencyNeedsReview: false,
      links: [
        { from: 'REQ-2', to: 'REQ-1' },
        { from: 'REQ-2', to: 'PER-1' },
        { from: 'REQ-1', to: 'PER-1' },
      ],
    };

    // Act
    const rows = dependencyTree('REQ-2', dependencies);

    // Assert
    expect(rows.map(row => [row.item.key, row.depth, row.repeat])).toEqual([
      ['REQ-2', 0, false],
      ['REQ-1', 1, false],
      ['PER-1', 2, false],
      ['PER-1', 1, true],
    ]);
  });

  it('stops at a cycle', () => {
    // Arrange
    const dependencies = {
      items: [item('A-1'), item('A-2')],
      dependencyNeedsReview: false,
      links: [
        { from: 'A-1', to: 'A-2' },
        { from: 'A-2', to: 'A-1' },
      ],
    };

    // Act
    const rows = dependencyTree('A-1', dependencies);

    // Assert
    expect(rows.map(row => [row.item.key, row.repeat])).toEqual([
      ['A-1', false],
      ['A-2', false],
      ['A-1', true],
    ]);
  });
});
