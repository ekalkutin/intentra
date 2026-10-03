import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { KnowledgeItem } from '../../domain/entities/index.js';
import {
  DecisionContent,
  KnowledgeSource,
} from '../../domain/value-objects/index.js';

import {
  toSimilarityFingerprint,
  toSimilarityText,
} from './similar-items.mapper.js';

function recordDecision(rationale: string | null): KnowledgeItem {
  return KnowledgeItem.record({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    source: KnowledgeSource.Manual,
    number: 1,
    title: 'MongoDB',
    rationale,
    content: new DecisionContent({
      decision: 'Keep the knowledge in MongoDB',
      area: null,
      context: null,
      rejectedAlternatives: [
        { alternative: 'PostgreSQL', reason: 'No team experience' },
      ],
    }),
    authorId: null,
    supersedes: null,
    links: [],
  });
}

describe('toSimilarityText', () => {
  it('reads the Kind, the title and every filled field, nested ones by their path', () => {
    // Arrange
    const item = recordDecision(null);

    // Act
    const text = toSimilarityText(item);

    // Assert
    expect(text).toBe(
      [
        'decision: MongoDB',
        'decision: Keep the knowledge in MongoDB',
        'rejectedAlternatives.alternative: PostgreSQL',
        'rejectedAlternatives.reason: No team experience',
      ].join('\n'),
    );
  });

  it('leaves the Rationale out: where an item came from does not change what it says', () => {
    // Arrange
    const plain = recordDecision(null);
    const explained = recordDecision('Ada: "we know Mongo"');

    // Act
    const fingerprints = [plain, explained].map(item =>
      toSimilarityFingerprint(toSimilarityText(item)),
    );

    // Assert
    expect(fingerprints[0]).toBe(fingerprints[1]);
  });
});
