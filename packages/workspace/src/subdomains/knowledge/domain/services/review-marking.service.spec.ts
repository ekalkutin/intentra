import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import {
  FeatureContent,
  KnowledgeKey,
  KnowledgeLink,
  KnowledgeLinkType,
  KnowledgeSource,
  RequirementContent,
  TermContent,
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

/** A Term numbered `number` meaning `definition`. */
function term(
  number: number,
  definition: string,
  supersedes: KnowledgeKey | null = null,
): KnowledgeItem {
  return KnowledgeItem.record({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    source: KnowledgeSource.Manual,
    number,
    title: 'Collision',
    rationale: null,
    content: new TermContent({ definition, sort: null, synonymsToAvoid: [] }),
    authorId: new MemberId().value,
    supersedes,
    links: [],
  });
}

/** A Feature numbered `number` with the given capability. */
function feature(
  number: number,
  capability: string,
  supersedes: KnowledgeKey | null = null,
): KnowledgeItem {
  return KnowledgeItem.record({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    source: KnowledgeSource.Manual,
    number,
    title: 'Invitations',
    rationale: null,
    content: new FeatureContent({ capability, outOfScope: [] }),
    authorId: new MemberId().value,
    supersedes,
    links: [dependsOn(GOAL_1)],
  });
}

function partOf(key: KnowledgeKey): KnowledgeLink {
  return new KnowledgeLink(KnowledgeLinkType.PartOf, key);
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

  it('moves the parts of a Feature onto its replacement, with no mark, even when it says something else', () => {
    // Arrange
    const replaced = feature(1, 'Invite a colleague by email');
    const replacement = feature(
      2,
      'Invite a colleague by email or by link',
      replaced.key,
    );
    const part = requirement(3, {
      links: [dependsOn(SC_1), partOf(replaced.key)],
    });

    // Act
    service.markSources(replaced, [part], replacement);

    // Assert
    expect(part.needsReview()).toBe(false);
    expect(part.feature?.value).toBe('FEAT-2');
  });

  it('marks the parts of a Feature retired or rejected', () => {
    // Arrange
    const dropped = feature(1, 'Invite a colleague by email');
    const part = requirement(3, { links: [partOf(dropped.key)] });

    // Act
    service.markSources(dropped, [part]);

    // Assert
    expect(part.needsReview()).toBe(true);
    expect(part.reviewCauses.map(cause => cause.value)).toEqual(['FEAT-1']);
  });

  it('moves what uses a replaced Term onto its replacement, with no mark', () => {
    // Arrange
    const replaced = term(1, 'Two articles that contradict each other');
    const replacement = term(
      2,
      'Two articles that contradict each other, or a stale one',
      replaced.key,
    );
    const user = requirement(3, {
      links: [
        dependsOn(SC_1),
        new KnowledgeLink(KnowledgeLinkType.UsesTerm, replaced.key),
      ],
    });

    // Act
    service.moveTermUsers(replaced, replacement, [user]);

    // Assert
    expect(user.needsReview()).toBe(false);
    expect(user.links.map(link => link.target.value)).toEqual([
      'SC-1',
      'TERM-2',
    ]);
  });
});
