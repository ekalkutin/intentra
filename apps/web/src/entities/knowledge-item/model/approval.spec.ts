import { describe, expect, it } from 'vitest';

import type {
  KnowledgeDependencyDto,
  KnowledgeItemAccessDto,
  KnowledgeStatusDto,
} from '@intentra/contracts/workspace';

import { planApproval } from './approval';

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
    };

    // Act
    const approval = planApproval(dependencies);

    // Assert
    expect(approval.blockers).toEqual([rejected, obsolete]);
  });
});
