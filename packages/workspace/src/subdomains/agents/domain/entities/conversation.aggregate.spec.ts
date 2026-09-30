import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import { InvalidConversationTitleException } from '../exceptions/index.js';
import { ConversationId } from '../value-objects/index.js';

import { Conversation } from './conversation.aggregate.js';

function startProps(memberId: MemberId, projectId: ProjectId) {
  return {
    id: new ConversationId().value,
    workspaceId: new WorkspaceId().value,
    projectId: projectId.value,
    memberId: memberId.value,
  };
}

describe('Conversation', () => {
  describe('start', () => {
    it('begins shown, with no title yet', () => {
      // Arrange
      const props = startProps(new MemberId(), new ProjectId());

      // Act
      const conversation = Conversation.start(props);

      // Assert
      expect(conversation.id.value).toBe(props.id);
      expect(conversation.title).toBeNull();
      expect(conversation.hidden).toBe(false);
      expect(conversation.updatedAt).toEqual(conversation.createdAt);
    });
  });

  describe('restore', () => {
    it('rejects an empty title', () => {
      // Arrange
      const props = startProps(new MemberId(), new ProjectId());
      const now = Temporal.Now.instant();

      // Act
      const restoring = () =>
        Conversation.restore({
          ...props,
          title: ' ',
          hidden: false,
          createdAt: now,
          updatedAt: now,
        });

      // Assert
      expect(restoring).toThrow(InvalidConversationTitleException);
    });
  });

  describe('isOf', () => {
    it('is only its Member’s, only in its Project', () => {
      // Arrange
      const memberId = new MemberId();
      const projectId = new ProjectId();
      const conversation = Conversation.start(startProps(memberId, projectId));

      // Act
      const verdicts = [
        conversation.isOf(memberId, projectId),
        conversation.isOf(new MemberId(), projectId),
        conversation.isOf(memberId, new ProjectId()),
      ];

      // Assert
      expect(verdicts).toEqual([true, false, false]);
    });
  });
});
