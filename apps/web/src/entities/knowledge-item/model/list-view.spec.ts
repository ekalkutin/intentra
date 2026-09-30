import { describe, expect, it } from 'vitest';

import type {
  KnowledgeItemDto,
  KnowledgeKindDto,
} from '@intentra/contracts/workspace';

import {
  groupByKind,
  inListOrder,
  knowledgeFilter,
  parseKnowledgeKind,
  parseKnowledgeView,
  readKnowledgeListState,
  viewCount,
  viewTotal,
} from './list-view';

function item(key: string, kind: KnowledgeKindDto): KnowledgeItemDto {
  return { key, kind } as KnowledgeItemDto;
}

describe('knowledgeFilter', () => {
  it('reads Drafts and Approved items marked Needs Review for the review view', () => {
    // Act
    const filter = knowledgeFilter('review', 'term');

    // Assert
    expect(filter).toEqual({
      statuses: ['draft', 'approved'],
      needsReview: true,
      kind: 'term',
      take: 200,
    });
  });

  it('reads every Kind when none is chosen', () => {
    // Act
    const filter = knowledgeFilter('rejected', null);

    // Assert
    expect(filter).toEqual({ statuses: ['rejected'], take: 200 });
  });
});

describe('parseKnowledgeView and parseKnowledgeKind', () => {
  it('fall back to the current knowledge of every Kind for unknown values', () => {
    // Act
    const view = parseKnowledgeView('everything');
    const kind = parseKnowledgeKind('essay');

    // Assert
    expect(view).toBe('current');
    expect(kind).toBeNull();
  });

  it('take the values the address names', () => {
    // Act
    const view = parseKnowledgeView('obsolete');
    const kind = parseKnowledgeKind('open-question');

    // Assert
    expect(view).toBe('obsolete');
    expect(kind).toBe('open-question');
  });
});

describe('groupByKind', () => {
  it('groups items under their Kinds in the model order, leaving empty Kinds out', () => {
    // Arrange
    const items = [
      item('DEC-1', 'decision'),
      item('REQ-1', 'requirement'),
      item('REQ-2', 'requirement'),
      item('PO-1', 'product-overview'),
    ];

    // Act
    const groups = groupByKind(items);

    // Assert
    expect(groups.map(group => group.kind)).toEqual([
      'product-overview',
      'requirement',
      'decision',
    ]);
    expect(groups[1]?.items.map(entry => entry.key)).toEqual([
      'REQ-1',
      'REQ-2',
    ]);
  });

  it('gives the items in the order the list shows them', () => {
    // Arrange
    const items = [item('TERM-1', 'term'), item('GOAL-1', 'goal')];

    // Act
    const ordered = inListOrder(items);

    // Assert
    expect(ordered.map(entry => entry.key)).toEqual(['GOAL-1', 'TERM-1']);
  });
});

describe('readKnowledgeListState', () => {
  it('reads the list search a row passed along', () => {
    // Act
    const state = readKnowledgeListState({ listSearch: '?view=drafts' });

    // Assert
    expect(state).toEqual({ listSearch: '?view=drafts' });
  });

  it('ignores anything else', () => {
    // Act
    const state = readKnowledgeListState({ from: 'elsewhere' });

    // Assert
    expect(state).toBeNull();
  });
});

describe('viewCount and viewTotal', () => {
  const requirements = {
    kind: 'requirement' as const,
    statuses: { draft: 2, approved: 5, rejected: 1, obsolete: 3 },
    needsReview: 1,
  };
  const terms = {
    kind: 'term' as const,
    statuses: { draft: 1, approved: 0, rejected: 0, obsolete: 0 },
    needsReview: 0,
  };

  it('counts each view of a Kind from its statuses and marks', () => {
    // Act
    const counts = (
      ['current', 'drafts', 'review', 'rejected', 'obsolete'] as const
    ).map(view => viewCount(requirements, view));

    // Assert
    expect(counts).toEqual([7, 2, 1, 1, 3]);
  });

  it('adds a view up over every Kind, or keeps to one', () => {
    // Act
    const all = viewTotal([requirements, terms], 'drafts', null);
    const one = viewTotal([requirements, terms], 'drafts', 'term');

    // Assert
    expect(all).toBe(3);
    expect(one).toBe(1);
  });
});
