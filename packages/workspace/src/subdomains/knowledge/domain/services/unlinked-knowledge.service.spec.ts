import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import {
  ConstraintContent,
  KnowledgeKey,
  KnowledgeLink,
  KnowledgeLinkType,
  KnowledgeSource,
  RequirementContent,
  TermContent,
  type KnowledgeContent,
} from '../value-objects/index.js';

import { UnlinkedKnowledgeService } from './unlinked-knowledge.service.js';

function approved(
  number: number,
  content: KnowledgeContent,
  links: readonly KnowledgeLink[] = [],
): KnowledgeItem {
  const item = KnowledgeItem.record({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    source: KnowledgeSource.Manual,
    number,
    title: `Item ${number}`,
    rationale: null,
    content,
    authorId: new MemberId().value,
    supersedes: null,
    links,
  });
  item.approve(new MemberId(), item.version);

  return item;
}

function requirement(
  type: 'functional' | 'non-functional',
): RequirementContent {
  return new RequirementContent({
    statement: 'The system does it',
    type,
    priority: null,
    acceptanceCriteria: [],
  });
}

describe('UnlinkedKnowledgeService', () => {
  it('finds the Approved items with no Link either way, outside the Project Frame', () => {
    // Arrange
    const term = approved(
      1,
      new TermContent({
        definition: 'A word',
        sort: null,
        synonymsToAvoid: [],
      }),
    );
    const user = approved(1, requirement('functional'), [
      new KnowledgeLink(
        KnowledgeLinkType.UsesTerm,
        KnowledgeKey.parse('TERM-1'),
      ),
    ]);
    const alone = approved(2, requirement('functional'));
    const quality = approved(3, requirement('non-functional'));
    const constraint = approved(
      1,
      new ConstraintContent({ constraint: 'EU only', imposedBy: null }),
    );

    // Act
    const unlinked = new UnlinkedKnowledgeService().findUnlinked([
      term,
      user,
      alone,
      quality,
      constraint,
    ]);

    // Assert
    expect(unlinked.map(item => item.key.value)).toEqual(['REQ-2']);
  });
});
