import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId, ProjectRole } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import {
  KnowledgeKind,
  KnowledgeSource,
  TermContent,
} from '../value-objects/index.js';

import { KnowledgePolicyService } from './knowledge-policy.service.js';

function recordTerm(): KnowledgeItem {
  return KnowledgeItem.record({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    source: KnowledgeSource.Manual,
    number: 1,
    title: 'Invitation',
    rationale: null,
    content: new TermContent({
      definition: 'An offer to join a Workspace',
      sort: null,
      synonymsToAvoid: [],
    }),
    authorId: new MemberId().value,
    supersedes: null,
    links: [],
  });
}

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

  it.each([
    [ProjectRole.Viewer, false],
    [ProjectRole.Contributor, false],
    [ProjectRole.Maintainer, true],
  ])('lets a %o approve and reject Drafts: %s', (projectRole, allowed) => {
    // Arrange
    const item = recordTerm();

    // Act
    const verdicts = [
      knowledgePolicyService.canApproveDraft(projectRole, item),
      knowledgePolicyService.canRejectDraft(projectRole, item),
    ];

    // Assert
    expect(verdicts).toEqual([allowed, allowed]);
  });

  it.each([
    [ProjectRole.Viewer, false, false, false],
    [ProjectRole.Contributor, true, false, false],
    [ProjectRole.Maintainer, true, true, true],
  ])(
    'on an Approved item lets a %o record a replacement: %s, retire it: %s, confirm it: %s',
    (projectRole, replacement, retirement, confirmation) => {
      // Arrange
      const item = recordTerm();
      item.approve(new MemberId(), item.version);

      // Act
      const verdicts = [
        knowledgePolicyService.canRecordReplacement(projectRole, item),
        knowledgePolicyService.canRetire(projectRole, item),
        knowledgePolicyService.canConfirm(projectRole, item),
      ];

      // Assert
      expect(verdicts).toEqual([replacement, retirement, confirmation]);
    },
  );

  it.each([
    [ProjectRole.Viewer, false],
    [ProjectRole.Contributor, true],
    [ProjectRole.Maintainer, true],
  ])('lets a %o confirm a Draft: %s', (projectRole, allowed) => {
    // Act
    const verdict = knowledgePolicyService.canConfirm(
      projectRole,
      recordTerm(),
    );

    // Assert
    expect(verdict).toBe(allowed);
  });
});
