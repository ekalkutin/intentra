import { describe, expect, it } from 'vitest';

import type {
  KnowledgeGapDto,
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
  it('fall back to every item of every Kind for unknown values', () => {
    // Act
    const view = parseKnowledgeView('everything');
    const kind = parseKnowledgeKind('essay');

    // Assert
    expect(view).toBe('all');
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
  const gaps: KnowledgeGapDto[] = [
    { rule: 'no-goal', item: null },
    {
      rule: 'unlinked',
      item: {
        key: 'REQ-1',
        kind: 'requirement',
        title: 'Export',
        status: 'approved',
      },
    },
  ];

  it('counts each view of a Kind from its statuses and marks', () => {
    // Act
    const counts = (
      [
        'all',
        'approved',
        'drafts',
        'review',
        'rejected',
        'obsolete',
        'gaps',
      ] as const
    ).map(view => viewCount(requirements, view, gaps));

    // Assert
    expect(counts).toEqual([11, 5, 2, 1, 1, 3, 1]);
  });

  it('adds a view up over every Kind, or keeps to one', () => {
    // Act
    const all = viewTotal([requirements, terms], 'drafts', null, gaps);
    const one = viewTotal([requirements, terms], 'drafts', 'term', gaps);

    // Assert
    expect(all).toBe(3);
    expect(one).toBe(1);
  });

  it('counts the Gaps of the Project as a whole only across every Kind', () => {
    // Act
    const all = viewTotal([requirements, terms], 'gaps', null, gaps);
    const one = viewTotal([requirements, terms], 'gaps', 'requirement', gaps);

    // Assert
    expect(all).toBe(2);
    expect(one).toBe(1);
  });
});
