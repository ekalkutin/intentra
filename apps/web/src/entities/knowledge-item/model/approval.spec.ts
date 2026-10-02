import { describe, expect, it } from 'vitest';

import type {
  KnowledgeDependencyDto,
  KnowledgeItemAccessDto,
  KnowledgeStatusDto,
} from '@intentra/contracts/workspace';

import { APPROVAL_BLOCKS, approvalBlockOf, planApproval } from './approval';

function dependency(
  key: string,
  status: KnowledgeStatusDto,
  { canApprove = true, needsReview = false } = {},
): KnowledgeDependencyDto {
  return {
    key,
    status,
    needsReview,
    version: 2,
    access: { canApprove } as KnowledgeItemAccessDto,
  } as KnowledgeDependencyDto;
}

describe('planApproval', () => {
  it('approves the Draft together with every Draft it depends on', () => {
    // Arrange
    const dependencies = {
      items: [
        dependency('REQ-1', 'draft'),
        dependency('PER-1', 'approved'),
        dependency('TERM-1', 'draft'),
      ],
      dependencyNeedsReview: false,
      links: [],
      answers: [],
    };

    // Act
    const approval = planApproval(dependencies);

    // Assert
    expect(approval.items).toEqual([
      { key: 'REQ-1', version: 2 },
      { key: 'TERM-1', version: 2 },
    ]);
    expect(approval.blockers).toEqual([]);
  });

  it('is blocked by a Draft the person may not approve or one that needs review', () => {
    // Arrange
    const forbidden = dependency('TERM-1', 'draft', { canApprove: false });
    const marked = dependency('DEC-1', 'draft', { needsReview: true });
    const dependencies = {
      items: [dependency('REQ-1', 'draft'), forbidden, marked],
      dependencyNeedsReview: true,
      links: [],
      answers: [],
    };

    // Act
    const approval = planApproval(dependencies);

    // Assert
    expect(approval.blockers).toEqual([forbidden, marked]);
  });

  it('is blocked by a Rejected or Obsolete item in the cascade', () => {
    // Arrange
    const rejected = dependency('TERM-1', 'rejected');
    const obsolete = dependency('PER-1', 'obsolete');
    const dependencies = {
      items: [dependency('REQ-1', 'draft'), rejected, obsolete],
      dependencyNeedsReview: false,
      links: [],
      answers: [],
    };

    // Act
    const approval = planApproval(dependencies);

    // Assert
    expect(approval.blockers).toEqual([rejected, obsolete]);
  });
});

describe('planApproval with answers', () => {
  it('approves a Draft Open Question the Draft answers in the same step', () => {
    // Arrange
    const dependencies = {
      items: [dependency('DEC-3', 'draft'), dependency('TBD-1', 'draft')],
      dependencyNeedsReview: false,
      links: [],
      answers: [{ from: 'DEC-3', to: 'TBD-1' }],
    };

    // Act
    const approval = planApproval(dependencies);

    // Assert
    expect(approval.items).toEqual([
      { key: 'DEC-3', version: 2 },
      { key: 'TBD-1', version: 2 },
    ]);
  });
});

describe('approvalBlockOf', () => {
  it('names why each kind of item stops the cascade', () => {
    // Arrange
    const items = [
      dependency('REQ-1', 'draft'),
      dependency('PER-1', 'approved', { needsReview: true }),
      dependency('TERM-1', 'draft', { canApprove: false }),
      dependency('DEC-1', 'draft', { needsReview: true }),
      dependency('BR-1', 'rejected'),
      dependency('PER-2', 'obsolete'),
    ];

    // Act
    const blocks = items.map(approvalBlockOf);

    // Assert
    expect(blocks).toEqual([
      null,
      null,
      APPROVAL_BLOCKS.forbidden,
      APPROVAL_BLOCKS.needsReview,
      APPROVAL_BLOCKS.rejected,
      APPROVAL_BLOCKS.obsolete,
    ]);
  });
});
