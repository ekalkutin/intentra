import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import {
  ContextPackRole,
  KnowledgeKey,
  KnowledgeSource,
  RequirementContent,
} from '../value-objects/index.js';

import {
  ContextPackAssemblyService,
  type ContextPackCandidate,
} from './context-pack-assembly.service.js';

/** An Approved Requirement, REQ-<number>. */
function requirement(number: number): KnowledgeItem {
  const item = KnowledgeItem.record({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    source: KnowledgeSource.Manual,
    number,
    title: `Requirement ${number}`,
    rationale: null,
    content: new RequirementContent({
      statement: `The system does ${number}`,
      type: null,
      priority: null,
      acceptanceCriteria: [],
    }),
    authorId: new MemberId().value,
    supersedes: null,
    links: [],
  });
  item.approve(new MemberId(), item.version);

  return item;
}

function candidate(
  item: KnowledgeItem,
  role: ContextPackRole,
  distance: number,
): ContextPackCandidate {
  return { item, role, distance };
}

describe('ContextPackAssemblyService', () => {
  const service = new ContextPackAssemblyService();

  it('keeps each item once, under its first role and nearest distance', () => {
    // Arrange
    const anchor = requirement(1);
    const other = requirement(2);

    // Act
    const entries = service.assemble(
      [
        candidate(anchor, ContextPackRole.Anchor, 0),
        candidate(other, ContextPackRole.Foundation, 3),
        candidate(other, ContextPackRole.Conflict, 1),
        candidate(anchor, ContextPackRole.Term, 1),
      ],
      40,
    );

    // Assert
    expect(
      entries.map(({ item, role, distance }) => [
        item.key.value,
        role,
        distance,
      ]),
    ).toEqual([
      ['REQ-1', ContextPackRole.Anchor, 0],
      ['REQ-2', ContextPackRole.Conflict, 1],
    ]);
  });

  it('orders by role, then distance, then key', () => {
    // Arrange
    const [a, b, c, d] = [4, 3, 2, 1].map(requirement);

    // Act
    const entries = service.assemble(
      [
        candidate(a!, ContextPackRole.Term, 1),
        candidate(b!, ContextPackRole.Foundation, 2),
        candidate(c!, ContextPackRole.Foundation, 1),
        candidate(d!, ContextPackRole.Anchor, 0),
      ],
      40,
    );

    // Assert
    expect(entries.map(({ item }) => item.key.value)).toEqual([
      'REQ-1',
      'REQ-2',
      'REQ-3',
      'REQ-4',
    ]);
  });

  it('fills the budget nearest first and keeps the rest brief, dropping nothing', () => {
    // Arrange
    const anchor = requirement(1);
    const near = requirement(2);
    const far = requirement(3);

    // Act
    const entries = service.assemble(
      [
        candidate(far, ContextPackRole.Foundation, 2),
        candidate(near, ContextPackRole.Foundation, 1),
        candidate(anchor, ContextPackRole.Anchor, 0),
      ],
      2,
    );

    // Assert
    expect(entries.map(({ item, inFull }) => [item.key.value, inFull])).toEqual(
      [
        ['REQ-1', true],
        ['REQ-2', true],
        ['REQ-3', false],
      ],
    );
  });

  it('shows Anchors, conflicts, open questions, rules and items under review in full past the budget', () => {
    // Arrange
    const marked = requirement(5);
    marked.markForReview(KnowledgeKey.parse('REQ-9'));

    // Act
    const entries = service.assemble(
      [
        candidate(requirement(1), ContextPackRole.Anchor, 0),
        candidate(requirement(2), ContextPackRole.Conflict, 1),
        candidate(requirement(3), ContextPackRole.Unsettled, 1),
        candidate(requirement(6), ContextPackRole.Rule, 3),
        candidate(requirement(4), ContextPackRole.Foundation, 1),
        candidate(marked, ContextPackRole.Foundation, 4),
      ],
      0,
    );

    // Assert
    expect(entries.map(({ item, inFull }) => [item.key.value, inFull])).toEqual(
      [
        ['REQ-1', true],
        ['REQ-2', true],
        ['REQ-3', true],
        ['REQ-6', true],
        ['REQ-4', false],
        ['REQ-5', true],
      ],
    );
  });
});
