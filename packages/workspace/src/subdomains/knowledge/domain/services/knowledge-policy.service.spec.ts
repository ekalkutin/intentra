import { describe, expect, it } from 'vitest';

import { ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeKind } from '../value-objects/index.js';

import { KnowledgePolicyService } from './knowledge-policy.service.js';

describe('KnowledgePolicyService', () => {
  const knowledgePolicyService = new KnowledgePolicyService();

  it.each([
    [ProjectRole.Viewer, false],
    [ProjectRole.Contributor, true],
    [ProjectRole.Maintainer, true],
  ])('lets a %o record Drafts: %s', (projectRole, allowed) => {
    // Act
    const verdict = knowledgePolicyService.canRecordDraft(
      projectRole,
      KnowledgeKind.Requirement,
    );

    // Assert
    expect(verdict).toBe(allowed);
  });
});
