import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import {
  InvalidLinkException,
  KnowledgeItemNeedsReviewException,
  KnowledgeItemNotApprovedException,
  KnowledgeItemNotMarkedException,
} from '../exceptions/index.js';
import {
  KnowledgeItemVersion,
  KnowledgeKey,
  KnowledgeLink,
  KnowledgeLinkType,
  KnowledgeSource,
  OpenQuestionContent,
  RequirementContent,
} from '../value-objects/index.js';

import { KnowledgeItem } from './knowledge-item.aggregate.js';

const REQ_12 = KnowledgeKey.parse('REQ-12');
const REQ_31 = KnowledgeKey.parse('REQ-31');
const TERM_3 = KnowledgeKey.parse('TERM-3');
const FEAT_2 = KnowledgeKey.parse('FEAT-2');
const FEAT_5 = KnowledgeKey.parse('FEAT-5');

function dependsOn(key: KnowledgeKey): KnowledgeLink {
  return new KnowledgeLink(KnowledgeLinkType.DependsOn, key);
}

function usesTerm(key: KnowledgeKey): KnowledgeLink {
  return new KnowledgeLink(KnowledgeLinkType.UsesTerm, key);
}

/** REQ-7, recorded with the given Links. */
function recordRequirement(links: readonly KnowledgeLink[]): KnowledgeItem {
  return KnowledgeItem.record({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    source: KnowledgeSource.Manual,
    number: 7,
    title: 'Export button',
    rationale: null,
    content: new RequirementContent({
      statement: 'A button exports the report',
      type: null,
      priority: null,
      acceptanceCriteria: [],
    }),
    authorId: new MemberId().value,
    supersedes: null,
    links,
  });
}

function partOf(key: KnowledgeKey): KnowledgeLink {
  return new KnowledgeLink(KnowledgeLinkType.PartOf, key);
}

function concerns(key: KnowledgeKey): KnowledgeLink {
  return new KnowledgeLink(KnowledgeLinkType.Concerns, key);
}

/** TBD-2, recorded with the given Links. */
function recordOpenQuestion(links: readonly KnowledgeLink[]): KnowledgeItem {
  return KnowledgeItem.record({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    source: KnowledgeSource.Manual,
    number: 2,
    title: 'Revoking by a Manager',
    rationale: null,
    content: new OpenQuestionContent({
      question: 'May a Manager revoke an Invitation?',
    }),
    authorId: new MemberId().value,
    supersedes: null,
    links,
  });
}

describe('KnowledgeItem Links', () => {
  it.each([
    ['to itself', [dependsOn(KnowledgeKey.parse('REQ-7'))]],
    ['twice', [dependsOn(REQ_12), dependsOn(REQ_12)]],
    ['of concerns from anything but an Open Question', [concerns(REQ_12)]],
    ['part of two Features', [partOf(FEAT_2), partOf(FEAT_5)]],
  ])('refuses a Link %s', (_case, links) => {
    // Act
    const recording = () => recordRequirement(links);

    // Assert
    expect(recording).toThrow(InvalidLinkException);
  });

  it('lets an Open Question say what it concerns, without resting on it', () => {
    // Act
    const question = recordOpenQuestion([concerns(REQ_12)]);

    // Assert
    expect(question.links).toEqual([concerns(REQ_12)]);
    expect(question.dependencies()).toEqual([]);
    expect(question.restsOn(REQ_12)).toBe(false);
  });

  it('refuses concerns when an edit gives it to another Kind', () => {
    // Arrange
    const item = recordRequirement([]);

    // Act
    const editing = () =>
      item.edit(new MemberId(), item.version, { links: [concerns(REQ_12)] });

    // Assert
    expect(editing).toThrow(InvalidLinkException);
  });

  it('rests on the Feature it is part of, which must be Approved first', () => {
    // Act
    const item = recordRequirement([dependsOn(REQ_12), partOf(FEAT_2)]);

    // Assert
    expect(item.feature).toEqual(FEAT_2);
    expect(item.dependencies()).toEqual([REQ_12, FEAT_2]);
  });

  it('refuses part of from an Open Question', () => {
    // Act
    const recording = () => recordOpenQuestion([partOf(FEAT_2)]);

    // Assert
    expect(recording).toThrow(InvalidLinkException);
  });

  it('keeps the same target under two types', () => {
    // Act
    const item = recordRequirement([
      dependsOn(REQ_12),
      new KnowledgeLink(KnowledgeLinkType.ConflictsWith, REQ_12),
    ]);

    // Assert
    expect(item.links).toHaveLength(2);
    expect(item.dependencies()).toEqual([REQ_12]);
  });

  describe('Feature Assignment', () => {
    /** REQ-7, Approved, with the given Links. */
    function approvedRequirement(
      links: readonly KnowledgeLink[],
    ): KnowledgeItem {
      const item = recordRequirement(links);
      item.approve(new MemberId(), item.version);

      return item;
    }

    it('moves an Approved item to another Feature, keeping its other Links and its Key', () => {
      // Arrange
      const item = approvedRequirement([dependsOn(REQ_12), partOf(FEAT_2)]);
      const assigner = new MemberId();

      // Act
      item.assignToFeature(assigner, item.version, FEAT_5);

      // Assert
      expect(item.key.value).toBe('REQ-7');
      expect(item.links).toEqual([dependsOn(REQ_12), partOf(FEAT_5)]);
      expect(item.featureAssignedBy).toEqual(assigner);
      expect(item.featureAssignedAt).not.toBeNull();
    });

    it('takes an Approved item out of its Feature, clearing the mark the Feature caused', () => {
      // Arrange
      const item = approvedRequirement([dependsOn(REQ_12), partOf(FEAT_2)]);
      item.markForReview(FEAT_2);
      item.markForReview(REQ_12);

      // Act
      item.assignToFeature(new MemberId(), item.version, null);

      // Assert
      expect(item.feature).toBeNull();
      expect(item.reviewCauses).toEqual([REQ_12]);
    });

    it('refuses a Draft, which is put into a Feature by editing its Links', () => {
      // Arrange
      const item = recordRequirement([]);

      // Act
      const assigning = () =>
        item.assignToFeature(new MemberId(), item.version, FEAT_2);

      // Assert
      expect(assigning).toThrow(KnowledgeItemNotApprovedException);
    });

    it('refuses a target that is not a Feature', () => {
      // Arrange
      const item = approvedRequirement([]);

      // Act
      const assigning = () =>
        item.assignToFeature(new MemberId(), item.version, REQ_31);

      // Assert
      expect(assigning).toThrow(InvalidLinkException);
    });
  });

  describe('Needs Review', () => {
    it('is marked once per changed target, and only through what it rests on', () => {
      // Arrange
      const item = recordRequirement([dependsOn(REQ_12), usesTerm(TERM_3)]);

      // Act
      item.markForReview(REQ_12);
      item.markForReview(REQ_12);

      // Assert
      expect(item.reviewCauses).toEqual([REQ_12]);
      expect(item.version.value).toBe(2);
      expect(item.restsOn(TERM_3)).toBe(false);
    });

    it('cannot be approved while marked', () => {
      // Arrange
      const item = recordRequirement([dependsOn(REQ_12)]);
      item.markForReview(REQ_12);

      // Act
      const approving = () => item.approve(new MemberId(), item.version);

      // Assert
      expect(approving).toThrow(KnowledgeItemNeedsReviewException);
    });

    it('is cleared by an edit only where it no longer rests on what changed', () => {
      // Arrange
      const kept = recordRequirement([dependsOn(REQ_12)]);
      const relinked = recordRequirement([dependsOn(REQ_12)]);
      kept.markForReview(REQ_12);
      relinked.markForReview(REQ_12);

      // Act
      kept.edit(new MemberId(), kept.version, { title: 'Export' });
      relinked.edit(new MemberId(), relinked.version, {
        links: [dependsOn(REQ_31)],
      });

      // Assert
      expect(kept.needsReview()).toBe(true);
      expect(relinked.needsReview()).toBe(false);
    });

    it('moves the Links onto the replacement when confirmed, or away if there is none', () => {
      // Arrange
      const TERM_4 = KnowledgeKey.parse('TERM-4');
      const item = recordRequirement([
        dependsOn(REQ_12),
        new KnowledgeLink(
          KnowledgeLinkType.JustifiedBy,
          KnowledgeKey.parse('DEC-2'),
        ),
        usesTerm(TERM_4),
      ]);
      item.markForReview(REQ_12);
      item.markForReview(KnowledgeKey.parse('DEC-2'));

      // Act
      item.confirm(item.version, cause =>
        cause.equals(REQ_12) ? REQ_31 : null,
      );

      // Assert
      expect(item.links.map(link => link.toProps())).toEqual([
        { type: 'depends-on', key: 'REQ-31' },
        { type: 'uses-term', key: 'TERM-4' },
      ]);
      expect(item.needsReview()).toBe(false);
    });

    it('refuses to confirm an unmarked item', () => {
      // Arrange
      const item = recordRequirement([]);

      // Act
      const confirming = () =>
        item.confirm(KnowledgeItemVersion.First, () => null);

      // Assert
      expect(confirming).toThrow(KnowledgeItemNotMarkedException);
    });
  });
});
