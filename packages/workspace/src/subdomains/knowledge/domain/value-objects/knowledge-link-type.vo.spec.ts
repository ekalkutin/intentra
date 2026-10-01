import { describe, expect, it } from 'vitest';

import { KnowledgeKind } from './knowledge-kind.vo.js';
import { KnowledgeLinkType } from './knowledge-link-type.vo.js';

describe('KnowledgeLinkType', () => {
  it.each([
    [KnowledgeLinkType.UsesTerm, KnowledgeKind.Term, true],
    [KnowledgeLinkType.UsesTerm, KnowledgeKind.Requirement, false],
    [KnowledgeLinkType.JustifiedBy, KnowledgeKind.Decision, true],
    [KnowledgeLinkType.JustifiedBy, KnowledgeKind.Constraint, false],
    [KnowledgeLinkType.Answers, KnowledgeKind.OpenQuestion, true],
    [KnowledgeLinkType.Answers, KnowledgeKind.Decision, false],
    [KnowledgeLinkType.DependsOn, KnowledgeKind.Persona, true],
    [KnowledgeLinkType.ConflictsWith, KnowledgeKind.Goal, true],
    [KnowledgeLinkType.Concerns, KnowledgeKind.Requirement, true],
  ])('%o allows a target of %o: %s', (type, kind, allowed) => {
    // Act
    const verdict = type.allowsTarget(kind);

    // Assert
    expect(verdict).toBe(allowed);
  });

  it.each([
    [KnowledgeLinkType.Concerns, KnowledgeKind.OpenQuestion, true],
    [KnowledgeLinkType.Concerns, KnowledgeKind.Requirement, false],
    [KnowledgeLinkType.DependsOn, KnowledgeKind.OpenQuestion, true],
    [KnowledgeLinkType.Answers, KnowledgeKind.Decision, true],
  ])('%o allows a source of %o: %s', (type, kind, allowed) => {
    // Act
    const verdict = type.allowsSource(kind);

    // Assert
    expect(verdict).toBe(allowed);
  });

  it('marks for review only through depends-on and justified-by', () => {
    // Act
    const marking = [
      KnowledgeLinkType.DependsOn,
      KnowledgeLinkType.UsesTerm,
      KnowledgeLinkType.JustifiedBy,
      KnowledgeLinkType.Answers,
      KnowledgeLinkType.Concerns,
      KnowledgeLinkType.ConflictsWith,
    ].filter(type => type.marksForReview());

    // Assert
    expect(marking).toEqual([
      KnowledgeLinkType.DependsOn,
      KnowledgeLinkType.JustifiedBy,
    ]);
  });
});
