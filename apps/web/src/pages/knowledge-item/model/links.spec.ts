import { describe, expect, it } from 'vitest';

import type {
  KnowledgeItemDto,
  KnowledgeLinkDto,
  KnowledgeStatusDto,
} from '@intentra/contracts/workspace';

import { groupLinks, incomingLinks } from './links';

function item(
  key: string,
  status: KnowledgeStatusDto,
  links: KnowledgeLinkDto[],
): KnowledgeItemDto {
  return { key, status, links } as KnowledgeItemDto;
}

describe('groupLinks', () => {
  it('groups Links by type in the model order', () => {
    // Arrange
    const links: KnowledgeLinkDto[] = [
      { type: 'uses-term', key: 'TERM-1' },
      { type: 'depends-on', key: 'REQ-1' },
      { type: 'uses-term', key: 'TERM-2' },
    ];

    // Act
    const groups = groupLinks(links);

    // Assert
    expect(groups).toEqual([
      { type: 'depends-on', keys: ['REQ-1'] },
      { type: 'uses-term', keys: ['TERM-1', 'TERM-2'] },
    ]);
  });
});

describe('incomingLinks', () => {
  it('finds the current items that link to a key, leaving Rejected and Obsolete out', () => {
    // Arrange
    const items = [
      item('REQ-1', 'approved', [{ type: 'uses-term', key: 'TERM-1' }]),
      item('REQ-2', 'draft', [{ type: 'depends-on', key: 'TERM-1' }]),
      item('REQ-3', 'rejected', [{ type: 'uses-term', key: 'TERM-1' }]),
      item('REQ-4', 'approved', [{ type: 'uses-term', key: 'TERM-2' }]),
    ];

    // Act
    const groups = incomingLinks('TERM-1', items);

    // Assert
    expect(groups).toEqual([
      { type: 'depends-on', keys: ['REQ-2'] },
      { type: 'uses-term', keys: ['REQ-1'] },
    ]);
  });
});
