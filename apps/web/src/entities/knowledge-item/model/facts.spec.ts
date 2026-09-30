import { describe, expect, it } from 'vitest';

import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import { factsOf } from './facts';

describe('factsOf', () => {
  it('gives choices, list sizes and one-line texts, leaving out the main field and gaps', () => {
    // Arrange
    const item = {
      kind: 'requirement',
      fields: {
        statement: 'Export as PDF',
        type: null,
        priority: 'must',
        acceptanceCriteria: ['Has a header', 'Has a total'],
      },
      answeredBy: [],
    } as unknown as KnowledgeItemDto;

    // Act
    const facts = factsOf(item);

    // Assert
    expect(facts).toEqual([
      { type: 'choice', field: 'priority', value: 'must' },
      { type: 'count', field: 'acceptanceCriteria', count: 2 },
    ]);
  });

  it('says first whether an Open Question has an answer', () => {
    // Arrange
    const item = {
      kind: 'open-question',
      fields: { question: 'Several currencies?' },
      answeredBy: ['DEC-3'],
    } as unknown as KnowledgeItemDto;

    // Act
    const facts = factsOf(item);

    // Assert
    expect(facts).toEqual([{ type: 'answer', answeredBy: ['DEC-3'] }]);
  });

  it('keeps an Integration external system as a text', () => {
    // Arrange
    const item = {
      kind: 'integration',
      fields: {
        purpose: 'Payments',
        externalSystem: 'Stripe',
        direction: 'outbound',
        exchanged: 'Invoices',
      },
      answeredBy: [],
    } as unknown as KnowledgeItemDto;

    // Act
    const facts = factsOf(item);

    // Assert
    expect(facts).toEqual([
      { type: 'text', field: 'externalSystem', value: 'Stripe' },
      { type: 'choice', field: 'direction', value: 'outbound' },
    ]);
  });
});
