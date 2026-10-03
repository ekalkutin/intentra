import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import {
  KnowledgeKey,
  KnowledgeLink,
  KnowledgeLinkType,
  KnowledgeSource,
  RequirementContent,
} from '../value-objects/index.js';

import { ReviewMarkingService } from './review-marking.service.js';

const SC_1 = KnowledgeKey.parse('SC-1');
const GOAL_1 = KnowledgeKey.parse('GOAL-1');

function dependsOn(key: KnowledgeKey): KnowledgeLink {
  return new KnowledgeLink(KnowledgeLinkType.DependsOn, key);
}

/** A Requirement numbered `number`, with the given title and Links. */
function requirement(
  number: number,
  {
    title = 'Export button',
    links = [],
    supersedes = null,
  }: {
    title?: string;
    links?: readonly KnowledgeLink[];
    supersedes?: KnowledgeKey | null;
  } = {},
): KnowledgeItem {
  return KnowledgeItem.record({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    source: KnowledgeSource.Manual,
    number,
    title,
    rationale: null,
    content: new RequirementContent({
      statement: 'A button exports the report',
      type: null,
      priority: null,
      acceptanceCriteria: [],
    }),
    authorId: new MemberId().value,
    supersedes,
    links,
  });
}

describe('ReviewMarkingService', () => {
  const service = new ReviewMarkingService();

  it('marks what rests on an item replaced by one that says something else', () => {
    // Arrange
    const replaced = requirement(1, { links: [dependsOn(SC_1)] });
    const replacement = requirement(2, {
      title: 'PDF export button',
      links: [dependsOn(SC_1)],
      supersedes: replaced.key,
    });
    const source = requirement(3, { links: [dependsOn(replaced.key)] });

    // Act
    service.markSources(replaced, [source], replacement);

    // Assert
    expect(source.needsReview()).toBe(true);
    expect(source.links[0]?.target.value).toBe('REQ-1');
  });

  it('moves what rests on an item onto a replacement that only adds Links, with no mark', () => {
    // Arrange
    const replaced = requirement(1, { links: [dependsOn(SC_1)] });
    const replacement = requirement(2, {
      links: [dependsOn(SC_1), dependsOn(GOAL_1)],
      supersedes: replaced.key,
    });
    const source = requirement(3, { links: [dependsOn(replaced.key)] });

    // Act
    service.markSources(replaced, [source], replacement);

    // Assert
    expect(source.needsReview()).toBe(false);
    expect(source.links.map(link => link.target.value)).toEqual(['REQ-2']);
  });

  it('marks what rests on an item whose replacement drops a Link', () => {
    // Arrange
    const replaced = requirement(1, { links: [dependsOn(SC_1)] });
    const replacement = requirement(2, {
      links: [dependsOn(GOAL_1)],
      supersedes: replaced.key,
    });
    const source = requirement(3, { links: [dependsOn(replaced.key)] });

    // Act
    service.markSources(replaced, [source], replacement);

    // Assert
    expect(source.needsReview()).toBe(true);
  });
});
