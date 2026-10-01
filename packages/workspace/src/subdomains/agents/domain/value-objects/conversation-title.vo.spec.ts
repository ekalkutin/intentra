import { describe, expect, it } from 'vitest';

import { InvalidConversationTitleException } from '../exceptions/index.js';

import { ConversationTitle } from './conversation-title.vo.js';

describe('ConversationTitle', () => {
  it('refuses an empty title a Member gives', () => {
    // Act
    const create = () => new ConversationTitle('   ');

    // Assert
    expect(create).toThrow(InvalidConversationTitleException);
  });

  describe('fromSuggestion', () => {
    it('keeps a short suggestion as it is', () => {
      // Act
      const title = ConversationTitle.fromSuggestion('Роли и права в X-Lance');

      // Assert
      expect(title?.value).toBe('Роли и права в X-Lance');
    });

    it('takes the first line of a whole answer, without markup', () => {
      // Arrange
      const answer =
        '**BR-2 — Право на создание проекта только у PM и выше**\n\nПродолжаю по порядку.';

      // Act
      const title = ConversationTitle.fromSuggestion(answer);

      // Assert
      expect(title?.value).toBe(
        'BR-2 — Право на создание проекта только у PM и выше',
      );
    });

    it('cuts a line longer than the limit, ending it with an ellipsis', () => {
      // Act
      const title = ConversationTitle.fromSuggestion('а'.repeat(500));

      // Assert
      expect(title?.value).toHaveLength(200);
      expect(title?.value.endsWith('…')).toBe(true);
    });

    it('gives none for an empty or markup-only suggestion', () => {
      // Act
      const titles = ['', '   ', '\n\n', '**  **'].map(text =>
        ConversationTitle.fromSuggestion(text),
      );

      // Assert
      expect(titles).toEqual([null, null, null, null]);
    });
  });
});
