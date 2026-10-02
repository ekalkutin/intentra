import { describe, expect, it } from 'vitest';

import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import { findingsOf, waitingCount } from './findings';

function question(
  key: string,
  status: KnowledgeItemDto['status'],
): KnowledgeItemDto {
  return { key, title: `Question ${key}`, status } as KnowledgeItemDto;
}

describe('findingsOf', () => {
  it('joins each key with its question, keeping the run order, and marks one gone since', () => {
    // Arrange
    const questions = [
      question('TBD-2', 'approved'),
      question('TBD-1', 'draft'),
    ];

    // Act
    const findings = findingsOf(['TBD-1', 'TBD-2', 'TBD-3'], questions);

    // Assert
    expect(findings).toEqual([
      { key: 'TBD-1', title: 'Question TBD-1', status: 'draft' },
      { key: 'TBD-2', title: 'Question TBD-2', status: 'approved' },
      { key: 'TBD-3', title: null, status: null },
    ]);
  });
});

describe('waitingCount', () => {
  it('counts the findings still waiting for a decision', () => {
    // Arrange
    const findings = findingsOf(
      ['TBD-1', 'TBD-2'],
      [question('TBD-1', 'draft'), question('TBD-2', 'rejected')],
    );

    // Act
    const waiting = waitingCount(findings);

    // Assert
    expect(waiting).toBe(1);
  });
});
