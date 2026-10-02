import { describe, expect, it } from 'vitest';

import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import { openQuestionsByKey } from './open-questions';

function question(
  key: string,
  concerns: readonly string[],
  change: Partial<Pick<KnowledgeItemDto, 'status' | 'answeredBy'>> = {},
): KnowledgeItemDto {
  return {
    key,
    kind: 'open-question',
    status: change.status ?? 'draft',
    answeredBy: change.answeredBy ?? [],
    links: concerns.map(target => ({ type: 'concerns', key: target })),
  } as unknown as KnowledgeItemDto;
}

describe('openQuestionsByKey', () => {
  it('names the open questions about each item, leaving out answered and settled ones', () => {
    // Arrange
    const open = question('TBD-1', ['BR-1', 'BR-2']);
    const items = [
      open,
      question('TBD-2', ['BR-1'], { answeredBy: ['DEC-1'] }),
      question('TBD-3', ['BR-1'], { status: 'rejected' }),
    ];

    // Act
    const byKey = openQuestionsByKey(items);

    // Assert
    expect(byKey.get('BR-1')).toEqual([open]);
    expect(byKey.get('BR-2')).toEqual([open]);
    expect(byKey.has('BR-3')).toBe(false);
  });
});
