import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import {
  BusinessRuleContent,
  FeatureContent,
  KnowledgeKey,
  KnowledgeLink,
  KnowledgeLinkType,
  KnowledgeSource,
  OpenQuestionContent,
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

function concerns(key: KnowledgeKey): KnowledgeLink {
  return new KnowledgeLink(KnowledgeLinkType.Concerns, key);
}

/** BR-`number`, a Draft. */
function businessRule(number: number): KnowledgeItem {
  return KnowledgeItem.record({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    source: KnowledgeSource.Manual,
    number,
    title: 'Card refunds',
    rationale: null,
    content: new BusinessRuleContent({
      rule: 'A card payment is refunded within 14 days',
    }),
    authorId: new MemberId().value,
    supersedes: null,
    links: [],
  });
}

/** TBD-`number`, a Draft about the given items, as an Analysis Run records it. */
function openQuestion(
  number: number,
  links: readonly KnowledgeLink[],
): KnowledgeItem {
  return KnowledgeItem.record({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    source: KnowledgeSource.AnalysisRun,
    number,
    title: 'Refund format',
    rationale: 'BR-7 and REQ-3 say different things about refunds',
    content: new OpenQuestionContent({
      question: 'Is a refund exported to PDF?',
    }),
    authorId: null,
    supersedes: null,
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

  describe('Open Questions', () => {
    it('marks a Draft and an Approved Open Question about a rejected item, naming it as the cause', () => {
      // Arrange
      const rejected = businessRule(7);
      const concerned = requirement(3);
      const draft = openQuestion(9, [
        concerns(rejected.key),
        concerns(concerned.key),
      ]);
      const approved = openQuestion(10, [concerns(rejected.key)]);
      approved.approve(new MemberId(), approved.version);
      rejected.reject(new MemberId(), rejected.version, null);

      // Act
      service.markSources(rejected, [draft, approved]);

      // Assert
      expect(draft.reviewCauses).toEqual([rejected.key]);
      expect(approved.reviewCauses).toEqual([rejected.key]);
    });

    it('does not mark an Open Question about a retired item', () => {
      // Arrange
      const retired = requirement(3);
      retired.approve(new MemberId(), retired.version);
      retired.retire(new MemberId(), retired.version, null);
      const question = openQuestion(9, [concerns(retired.key)]);

      // Act
      service.markSources(retired, [question]);

      // Assert
      expect(question.needsReview()).toBe(false);
    });

    it('does not mark an Open Question about a replaced item', () => {
      // Arrange
      const replaced = requirement(1);
      replaced.approve(new MemberId(), replaced.version);
      const replacement = requirement(2, {
        title: 'PDF export button',
        supersedes: replaced.key,
      });
      replacement.approve(new MemberId(), replacement.version);
      replaced.becomeSupersededBy(replacement.key, new MemberId());
      const question = openQuestion(9, [concerns(replaced.key)]);

      // Act
      service.markSources(replaced, [question], replacement);

      // Assert
      expect(question.needsReview()).toBe(false);
      expect(question.links).toEqual([concerns(replaced.key)]);
    });

    it('marks nothing when the rejected item is concerned by no Open Question', () => {
      // Arrange
      const rejected = businessRule(7);
      rejected.reject(new MemberId(), rejected.version, null);
      const question = openQuestion(9, [concerns(KnowledgeKey.parse('REQ-3'))]);

      // Act
      service.markSources(rejected, [question]);

      // Assert
      expect(question.needsReview()).toBe(false);
      expect(question.version.value).toBe(1);
    });
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
