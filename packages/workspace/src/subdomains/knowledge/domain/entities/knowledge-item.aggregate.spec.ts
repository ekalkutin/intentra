import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import {
  InvalidKnowledgeTitleException,
  KnowledgeKindMismatchException,
} from '../exceptions/index.js';
import {
  DecisionContent,
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
    number: 3,
    title: 'Invitation',
    rationale: null,
    content: term('An offer to join a Workspace'),
    authorId: authorId.value,
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
      expect(item.authorId.equals(authorId)).toBe(true);
      expect(item.lastEditedBy).toBeNull();
      expect(item.lastEditedAt).toBeNull();
    });

    it('rejects a blank title', () => {
      // Act
      const recording = () =>
        KnowledgeItem.record({
          workspaceId: new WorkspaceId().value,
          projectId: new ProjectId().value,
          number: 1,
          title: ' ',
          rationale: null,
          content: term('An offer to join a Workspace'),
          authorId: new MemberId().value,
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
      item.edit(editorId, {
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
      expect(item.authorId.equals(authorId)).toBe(true);
      expect(item.lastEditedBy?.equals(editorId)).toBe(true);
      expect(item.lastEditedAt).not.toBeNull();
    });

    it('clears the rationale when given null', () => {
      // Arrange
      const item = recordTerm();
      item.edit(new MemberId(), { rationale: 'A quote' });

      // Act
      item.edit(new MemberId(), { rationale: null });

      // Assert
      expect(item.rationale).toBeNull();
    });

    it('never changes its Kind', () => {
      // Arrange
      const item = recordTerm();

      // Act
      const editing = () =>
        item.edit(new MemberId(), {
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
  });
});
