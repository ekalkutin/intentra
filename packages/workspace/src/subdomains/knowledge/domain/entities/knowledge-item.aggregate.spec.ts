import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import {
  InvalidKnowledgeTitleException,
  KnowledgeItemChangedException,
  KnowledgeItemNotApprovedException,
  KnowledgeItemNotDraftException,
  KnowledgeKindMismatchException,
  RationaleRequiredException,
  SupersededItemNotApprovedException,
} from '../exceptions/index.js';
import {
  DecisionContent,
  KnowledgeItemVersion,
  KnowledgeKey,
  KnowledgeKind,
  KnowledgeSource,
  KnowledgeStatus,
  TermContent,
} from '../value-objects/index.js';

import { KnowledgeItem } from './knowledge-item.aggregate.js';

function term(definition: string): TermContent {
  return new TermContent({ definition, sort: null, synonymsToAvoid: [] });
}

function recordTerm(authorId = new MemberId()): KnowledgeItem {
  return KnowledgeItem.record({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    source: KnowledgeSource.Manual,
    number: 3,
    title: 'Invitation',
    rationale: null,
    content: term('An offer to join a Workspace'),
    authorId: authorId.value,
    supersedes: null,
    links: [],
  });
}

describe('KnowledgeItem', () => {
  describe('record', () => {
    it('records a Draft entered by hand, keyed by its Kind', () => {
      // Arrange
      const authorId = new MemberId();

      // Act
      const item = recordTerm(authorId);

      // Assert
      expect(item.key.value).toBe('TERM-3');
      expect(item.kind).toBe(KnowledgeKind.Term);
      expect(item.status).toBe(KnowledgeStatus.Draft);
      expect(item.source).toBe(KnowledgeSource.Manual);
      expect(item.author.memberId?.equals(authorId)).toBe(true);
      expect(item.lastEditedBy).toBeNull();
      expect(item.lastEditedAt).toBeNull();
      expect(item.version).toBe(KnowledgeItemVersion.First);
    });

    it('needs a rationale when an agent records it', () => {
      // Act
      const recording = () =>
        KnowledgeItem.record({
          workspaceId: new WorkspaceId().value,
          projectId: new ProjectId().value,
          source: KnowledgeSource.ExternalAgent,
          number: 1,
          title: 'Invitation',
          rationale: null,
          content: term('An offer to join a Workspace'),
          authorId: new MemberId().value,
          supersedes: null,
          links: [],
        });

      // Assert
      expect(recording).toThrow(RationaleRequiredException);
    });

    it('rejects a blank title', () => {
      // Act
      const recording = () =>
        KnowledgeItem.record({
          workspaceId: new WorkspaceId().value,
          projectId: new ProjectId().value,
          source: KnowledgeSource.Manual,
          number: 1,
          title: ' ',
          rationale: null,
          content: term('An offer to join a Workspace'),
          authorId: new MemberId().value,
          supersedes: null,
          links: [],
        });

      // Assert
      expect(recording).toThrow(InvalidKnowledgeTitleException);
    });
  });

  describe('edit', () => {
    it('changes what is given, keeps the author and records the last editor', () => {
      // Arrange
      const authorId = new MemberId();
      const editorId = new MemberId();
      const item = recordTerm(authorId);

      // Act
      item.edit(editorId, KnowledgeItemVersion.First, {
        rationale: 'Bob: "owners invite people by email"',
        content: term('An offer, sent by email, to join a Workspace'),
      });

      // Assert
      expect(item.title.value).toBe('Invitation');
      expect(item.rationale?.value).toBe(
        'Bob: "owners invite people by email"',
      );
      expect(item.content.mainField.value).toBe(
        'An offer, sent by email, to join a Workspace',
      );
      expect(item.author.memberId?.equals(authorId)).toBe(true);
      expect(item.lastEditedBy?.equals(editorId)).toBe(true);
      expect(item.lastEditedAt).not.toBeNull();
      expect(item.version.value).toBe(2);
    });

    it('clears the rationale when given null', () => {
      // Arrange
      const item = recordTerm();
      item.edit(new MemberId(), KnowledgeItemVersion.First, {
        rationale: 'A quote',
      });

      // Act
      item.edit(new MemberId(), item.version, { rationale: null });

      // Assert
      expect(item.rationale).toBeNull();
    });

    it('never changes its Kind', () => {
      // Arrange
      const item = recordTerm();

      // Act
      const editing = () =>
        item.edit(new MemberId(), KnowledgeItemVersion.First, {
          content: new DecisionContent({
            decision: 'Invite by email',
            area: null,
            context: null,
            rejectedAlternatives: [],
          }),
        });

      // Assert
      expect(editing).toThrow(KnowledgeKindMismatchException);
      expect(item.lastEditedBy).toBeNull();
    });

    it('refuses a change made on an older version', () => {
      // Arrange
      const item = recordTerm();
      item.edit(new MemberId(), KnowledgeItemVersion.First, {
        title: 'Invite',
      });

      // Act
      const editing = () =>
        item.edit(new MemberId(), KnowledgeItemVersion.First, {
          title: 'Invitation',
        });

      // Assert
      expect(editing).toThrow(KnowledgeItemChangedException);
      expect(item.title.value).toBe('Invite');
    });
  });

  describe('approve', () => {
    it('makes the Draft Approved and records who approved it and when', () => {
      // Arrange
      const approverId = new MemberId();
      const item = recordTerm();

      // Act
      item.approve(approverId, KnowledgeItemVersion.First);

      // Assert
      expect(item.status).toBe(KnowledgeStatus.Approved);
      expect(item.approvedBy?.equals(approverId)).toBe(true);
      expect(item.approvedAt).not.toBeNull();
      expect(item.version.value).toBe(2);
    });

    it('refuses to approve a version the approver did not see', () => {
      // Arrange
      const item = recordTerm();
      item.edit(new MemberId(), KnowledgeItemVersion.First, {
        content: term('An offer, sent by email, to join a Workspace'),
      });

      // Act
      const approving = () =>
        item.approve(new MemberId(), KnowledgeItemVersion.First);

      // Assert
      expect(approving).toThrow(KnowledgeItemChangedException);
      expect(item.isDraft()).toBe(true);
    });
  });

  describe('reject', () => {
    it('makes the Draft Rejected, treating a blank reason as none', () => {
      // Arrange
      const rejecterId = new MemberId();
      const item = recordTerm();

      // Act
      item.reject(rejecterId, KnowledgeItemVersion.First, ' ');

      // Assert
      expect(item.status).toBe(KnowledgeStatus.Rejected);
      expect(item.rejectedBy?.equals(rejecterId)).toBe(true);
      expect(item.rejectedAt).not.toBeNull();
      expect(item.rejectionReason).toBeNull();
    });
  });

  describe('once decided', () => {
    it.each([
      [
        'approved',
        (item: KnowledgeItem) =>
          item.approve(new MemberId(), KnowledgeItemVersion.First),
      ],
      [
        'rejected',
        (item: KnowledgeItem) =>
          item.reject(new MemberId(), KnowledgeItemVersion.First, 'Wrong'),
      ],
    ])('never changes once %s', (_status, decide) => {
      // Arrange
      const item = recordTerm();
      decide(item);
      const version = item.version;

      // Act
      const changes = [
        () => item.edit(new MemberId(), version, { title: 'Invite' }),
        () => item.approve(new MemberId(), version),
        () => item.reject(new MemberId(), version, null),
        () => item.ensureDeletable(version),
      ];

      // Assert
      for (const change of changes) {
        expect(change).toThrow(KnowledgeItemNotDraftException);
      }
    });
  });

  describe('supersession', () => {
    it('refuses to replace an item of another Kind', () => {
      // Act
      const recording = () =>
        KnowledgeItem.record({
          workspaceId: new WorkspaceId().value,
          projectId: new ProjectId().value,
          source: KnowledgeSource.Manual,
          number: 4,
          title: 'Invitation',
          rationale: null,
          content: term('An offer to join a Workspace'),
          authorId: new MemberId().value,
          supersedes: KnowledgeKey.parse('REQ-1'),
          links: [],
        });

      // Assert
      expect(recording).toThrow(KnowledgeKindMismatchException);
    });

    it('makes an Approved item Obsolete, superseded by its replacement', () => {
      // Arrange
      const approverId = new MemberId();
      const item = recordTerm();
      item.approve(new MemberId(), KnowledgeItemVersion.First);

      // Act
      item.becomeSupersededBy(KnowledgeKey.parse('TERM-9'), approverId);

      // Assert
      expect(item.status).toBe(KnowledgeStatus.Obsolete);
      expect(item.supersededByKey?.value).toBe('TERM-9');
      expect(item.supersededBy?.equals(approverId)).toBe(true);
      expect(item.supersededAt).not.toBeNull();
      expect(item.version.value).toBe(3);
    });

    it('refuses to replace an item that is not Approved', () => {
      // Arrange
      const item = recordTerm();

      // Act
      const superseding = () =>
        item.becomeSupersededBy(KnowledgeKey.parse('TERM-9'), new MemberId());

      // Assert
      expect(superseding).toThrow(SupersededItemNotApprovedException);
    });
  });

  describe('retire', () => {
    it('makes an Approved item Obsolete with nothing to replace it', () => {
      // Arrange
      const retirerId = new MemberId();
      const item = recordTerm();
      item.approve(new MemberId(), KnowledgeItemVersion.First);

      // Act
      item.retire(retirerId, item.version, 'Invitations were dropped');

      // Assert
      expect(item.status).toBe(KnowledgeStatus.Obsolete);
      expect(item.retiredBy?.equals(retirerId)).toBe(true);
      expect(item.retirementReason?.value).toBe('Invitations were dropped');
    });

    it('refuses a Draft and an older version', () => {
      // Arrange
      const draft = recordTerm();
      const approved = recordTerm();
      approved.approve(new MemberId(), KnowledgeItemVersion.First);

      // Act
      const retiringDraft = () =>
        draft.retire(new MemberId(), KnowledgeItemVersion.First, null);
      const retiringStale = () =>
        approved.retire(new MemberId(), KnowledgeItemVersion.First, null);

      // Assert
      expect(retiringDraft).toThrow(KnowledgeItemNotApprovedException);
      expect(retiringStale).toThrow(KnowledgeItemChangedException);
    });
  });
});
