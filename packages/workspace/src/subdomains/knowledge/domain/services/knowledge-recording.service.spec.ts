import { describe, expect, it } from 'vitest';

import { WorkspaceId } from '@intentra/shared-kernel';

import { MemberId, Project, ProjectRole } from '../../../tenancy/index.js';
import { IntentraRecordingForbiddenException } from '../exceptions/index.js';
import {
  KnowledgeAuthor,
  KnowledgeSource,
  OpenQuestionContent,
  TermContent,
  type KnowledgeContent,
} from '../value-objects/index.js';

import { KnowledgeRecordingService } from './knowledge-recording.service.js';

const project = Project.create({
  workspaceId: new WorkspaceId().value,
  name: 'Billing',
  slug: 'billing',
  createdBy: new MemberId().value,
});

function recordAs(author: KnowledgeAuthor, content: KnowledgeContent) {
  return new KnowledgeRecordingService().record(
    project,
    author,
    ProjectRole.Contributor,
    {
      source: KnowledgeSource.AnalysisRun,
      number: 1,
      title: 'Export format',
      rationale: 'REQ-1 says PDF, BR-1 says CSV',
      content,
      replaced: null,
      links: [],
      linkTargets: [],
    },
  );
}

const question = new OpenQuestionContent({
  question: 'Which format does an export use?',
});

describe('KnowledgeRecordingService', () => {
  it('records an Open Question by Intentra itself, with no Member', () => {
    // Act
    const item = recordAs(KnowledgeAuthor.Intentra, question);

    // Assert
    expect(item.author.isIntentra()).toBe(true);
    expect(item.author.memberId).toBeNull();
  });

  it('refuses any other Kind from Intentra itself', () => {
    // Arrange
    const term = new TermContent({
      definition: 'A word',
      sort: null,
      synonymsToAvoid: [],
    });

    // Act
    const recording = () => recordAs(KnowledgeAuthor.Intentra, term);

    // Assert
    expect(recording).toThrow(IntentraRecordingForbiddenException);
  });

  it('records any Kind by a Member', () => {
    // Arrange
    const memberId = new MemberId();

    // Act
    const item = recordAs(KnowledgeAuthor.member(memberId), question);

    // Assert
    expect(item.author.memberId?.equals(memberId)).toBe(true);
  });
});
