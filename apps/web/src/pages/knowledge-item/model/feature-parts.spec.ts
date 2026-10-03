import { describe, expect, it, vi } from 'vitest';

import type {
  KnowledgeItemDto,
  KnowledgeKindDto,
  KnowledgeStatusDto,
} from '@intentra/contracts/workspace';

import { PART_BLOCKS, partCandidates, planPartChange } from './feature-parts';

// The Feature helpers come through the slice's public API, which also sets up
// its endpoints; those touch the browser's window when imported.
vi.hoisted(() => {
  Object.assign(globalThis, {
    window: {
      addEventListener: () => undefined,
      matchMedia: () => ({ matches: false }),
    },
  });
});

function item(
  key: string,
  kind: KnowledgeKindDto,
  status: KnowledgeStatusDto,
  {
    feature = null,
    canEdit = true,
    canAssignToFeature = true,
  }: {
    feature?: string | null;
    canEdit?: boolean;
    canAssignToFeature?: boolean;
  } = {},
): KnowledgeItemDto {
  return {
    key,
    kind,
    status,
    links: feature ? [{ type: 'part-of', key: feature }] : [],
    access: { canEdit, canAssignToFeature },
  } as KnowledgeItemDto;
}

describe('partCandidates', () => {
  it('offers the Scenarios, Requirements and Business Rules the Member may move, from other Features too', () => {
    // Arrange
    const feature = item('FEAT-1', 'feature', 'approved');
    const items = [
      feature,
      item('SC-1', 'scenario', 'approved'),
      item('REQ-1', 'requirement', 'draft', { feature: 'FEAT-2' }),
      item('BR-1', 'business-rule', 'approved', { feature: 'FEAT-1' }),
      item('BR-2', 'business-rule', 'approved', { canAssignToFeature: false }),
      item('REQ-2', 'requirement', 'rejected'),
      item('TERM-1', 'term', 'approved'),
    ];

    // Act
    const candidates = partCandidates(feature, items);

    // Assert
    expect(candidates.map(({ item: each, from }) => [each.key, from])).toEqual([
      ['SC-1', null],
      ['REQ-1', 'FEAT-2'],
    ]);
  });

  it('holds back an Approved item while the Feature is a Draft', () => {
    // Arrange
    const feature = item('FEAT-1', 'feature', 'draft');
    const items = [
      item('SC-1', 'scenario', 'approved'),
      item('SC-2', 'scenario', 'draft'),
    ];

    // Act
    const candidates = partCandidates(feature, items);

    // Assert
    expect(candidates.map(({ block }) => block)).toEqual([
      PART_BLOCKS.featureNotApproved,
      null,
    ]);
  });
});

describe('planPartChange', () => {
  it('assigns the Approved items and edits the Drafts', () => {
    // Arrange
    const items = [
      item('SC-1', 'scenario', 'approved'),
      item('SC-2', 'scenario', 'draft'),
    ];

    // Act
    const plan = planPartChange(items);

    // Assert
    expect(plan.assigned.map(each => each.key)).toEqual(['SC-1']);
    expect(plan.edited.map(each => each.key)).toEqual(['SC-2']);
  });
});
