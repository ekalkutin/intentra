import { describe, expect, it } from 'vitest';

import type {
  KnowledgeContextEntryDto,
  KnowledgeContextItemDto,
} from '@intentra/contracts/workspace';

import {
  drawContextPack,
  drawProjectFrame,
} from './knowledge-context.mapper.js';

const decision: KnowledgeContextEntryDto = {
  key: 'DEC-1',
  kind: 'decision',
  title: 'Invitations expire',
  mainField: 'An Invitation lives seven days',
  fields: {
    decision: 'An Invitation lives seven days',
    area: 'product',
    context: null,
    rejectedAlternatives: [
      { alternative: 'Forever', reason: 'stale invitations pile up' },
    ],
  },
  rationale: 'Ada: "a week is enough"',
  links: [{ type: 'uses-term', key: 'TERM-1' }],
  needsReview: true,
  reviewCauses: ['REQ-9'],
};

describe('drawContextPack', () => {
  it('draws each role under its heading, the far items on one line, and the Drafts nearby', () => {
    // Arrange
    const items: KnowledgeContextItemDto[] = [
      { ...decision, role: 'anchor', distance: 0, detail: 'full' },
      {
        key: 'TERM-1',
        kind: 'term',
        title: 'Invitation',
        mainField: 'An offer to join a Workspace',
        needsReview: false,
        role: 'term',
        distance: 1,
        detail: 'brief',
      },
    ];

    // Act
    const markdown = drawContextPack({
      anchors: ['DEC-1'],
      items,
      draftsNearby: [
        { key: 'BR-2', kind: 'business-rule', title: 'Revoked stays revoked' },
      ],
    });

    // Assert
    expect(markdown).toContain(
      [
        '## Anchors: the subject of this task',
        '',
        '### DEC-1 · Decision · Invitations expire',
        '',
        'An Invitation lives seven days',
        '',
        '- **Area:** product',
        '- **Rejected alternatives:**',
        '  - Forever: stale invitations pile up',
        '- **Rationale:** Ada: "a week is enough"',
        '- **Links:** uses term TERM-1',
        '',
        '> Needs review: it rests on REQ-9, which has changed. Check with the person that it still holds.',
      ].join('\n'),
    );
    expect(markdown).toContain(
      '## Terms\n\n- `TERM-1` · Term · Invitation: An offer to join a Workspace',
    );
    expect(markdown).toContain('BR-2 (Business Rule: Revoked stays revoked)');
    expect(markdown).not.toContain('## Foundation');
  });
});

describe('drawProjectFrame', () => {
  it('says when nothing of the frame is approved yet', () => {
    // Act
    const markdown = drawProjectFrame([]);

    // Assert
    expect(markdown).toContain('Nothing of it is approved yet.');
  });
});
