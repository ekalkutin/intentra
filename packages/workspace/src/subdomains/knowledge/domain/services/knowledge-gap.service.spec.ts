import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { MemberId } from '../../../tenancy/index.js';
import { KnowledgeItem } from '../entities/index.js';
import {
  BusinessRuleContent,
  ConstraintContent,
  DecisionContent,
  GoalContent,
  IntegrationContent,
  KnowledgeKey,
  KnowledgeLink,
  KnowledgeLinkType,
  KnowledgeSource,
  PersonaContent,
  ProductOverviewContent,
  RequirementContent,
  ScenarioContent,
  TermContent,
  type KnowledgeContent,
  type KnowledgeGap,
} from '../value-objects/index.js';

import { KnowledgeGapService } from './knowledge-gap.service.js';

function draft(
  number: number,
  content: KnowledgeContent,
  links: readonly KnowledgeLink[] = [],
): KnowledgeItem {
  return KnowledgeItem.record({
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
}

function approved(
  number: number,
  content: KnowledgeContent,
  links: readonly KnowledgeLink[] = [],
): KnowledgeItem {
  const item = draft(number, content, links);
  item.approve(new MemberId(), item.version);

  return item;
}

function dependsOn(key: string): KnowledgeLink {
  return new KnowledgeLink(
    KnowledgeLinkType.DependsOn,
    KnowledgeKey.parse(key),
  );
}

const overview = new ProductOverviewContent({
  summary: 'A product',
  problem: null,
  audience: null,
  value: null,
});

const goal = new GoalContent({ outcome: 'Grow', successMetric: '10%' });

function persona(type: 'person' | 'system' | null): PersonaContent {
  return new PersonaContent({ profile: 'Someone', type, needs: [] });
}

const scenario = new ScenarioContent({ expectedResult: 'Done', steps: [] });

function requirement(
  props: Partial<{
    type: 'functional' | 'non-functional';
    priority: 'must' | 'should';
    acceptanceCriteria: string[];
  }> = {},
): RequirementContent {
  return new RequirementContent({
    statement: 'The system does it',
    type: props.type ?? 'functional',
    priority: props.priority ?? null,
    acceptanceCriteria: props.acceptanceCriteria ?? [],
  });
}

function describeGaps(gaps: readonly KnowledgeGap[]): string[] {
  return gaps.map(gap => `${gap.rule.value} ${gap.key?.value ?? '-'}`);
}

/** A Product Overview, a Persona with its Scenario and its Requirement, and a Goal: no Gap of the skeleton or of coverage. */
function complete(): KnowledgeItem[] {
  return [
    approved(1, overview),
    approved(1, goal, [dependsOn('PO-1')]),
    approved(1, persona('person'), [dependsOn('GOAL-1')]),
    approved(1, scenario, [dependsOn('PER-1')]),
    approved(1, requirement(), [dependsOn('SC-1')]),
  ];
}

describe('KnowledgeGapService', () => {
  it('finds the skeleton missing from an empty Project', () => {
    // Arrange
    const service = new KnowledgeGapService();

    // Act
    const gaps = service.findGaps([]);

    // Assert
    expect(describeGaps(gaps)).toEqual([
      'no-product-overview -',
      'no-persona -',
      'no-goal -',
    ]);
  });

  it('finds nothing in a Project that is complete', () => {
    // Arrange
    const service = new KnowledgeGapService();

    // Act
    const gaps = service.findGaps(complete());

    // Assert
    expect(gaps).toEqual([]);
  });

  it('finds the empty fields that matter, on Drafts and Approved items alike', () => {
    // Arrange
    const items = [
      ...complete(),
      approved(2, requirement({ priority: 'must' }), [dependsOn('SC-1')]),
      draft(3, requirement({ priority: 'must' }), [dependsOn('SC-1')]),
      draft(4, requirement({ priority: 'should' }), [dependsOn('SC-1')]),
      draft(
        5,
        requirement({ priority: 'must', acceptanceCriteria: ['It works'] }),
        [dependsOn('SC-1')],
      ),
      draft(2, new GoalContent({ outcome: 'Keep', successMetric: null })),
      draft(
        1,
        new DecisionContent({
          decision: 'Use MongoDB',
          area: null,
          context: null,
          rejectedAlternatives: [],
        }),
      ),
      draft(
        2,
        new DecisionContent({
          decision: 'Use Nest',
          area: null,
          context: null,
          rejectedAlternatives: [{ alternative: 'Express', reason: null }],
        }),
      ),
    ];

    // Act
    const gaps = new KnowledgeGapService().findGaps(items);

    // Assert
    expect(describeGaps(gaps)).toEqual([
      'requirement-without-acceptance-criteria REQ-2',
      'requirement-without-acceptance-criteria REQ-3',
      'goal-without-success-metric GOAL-2',
      'decision-without-rejected-alternatives DEC-1',
    ]);
  });

  it('finds the gaps of coverage, a Draft closing one as an Approved item does', () => {
    // Arrange
    const items = [
      ...complete(),
      approved(2, persona('person')),
      draft(3, persona(null)),
      approved(4, persona('system')),
      approved(5, persona('person')),
      draft(2, scenario, [dependsOn('PER-5')]),
      approved(3, scenario),
      approved(1, new IntegrationContent(integration())),
      approved(2, new IntegrationContent(integration())),
      draft(1, new BusinessRuleContent({ rule: 'Always' }), [
        dependsOn('INT-2'),
      ]),
    ];

    // Act
    const gaps = new KnowledgeGapService().findGaps(items);

    // Assert
    expect(describeGaps(gaps)).toEqual([
      'scenario-without-persona SC-3',
      'persona-without-scenario PER-2',
      'persona-without-scenario PER-3',
      'scenario-without-requirement SC-2',
      'scenario-without-requirement SC-3',
      'integration-without-use INT-1',
      'unlinked PER-2',
      'unlinked PER-4',
      'unlinked PER-5',
      'unlinked SC-3',
      'unlinked INT-1',
      'unlinked INT-2',
    ]);
  });

  it('finds the Approved items with no Link either way, outside the Project Frame', () => {
    // Arrange
    const items = [
      ...complete(),
      approved(
        1,
        new TermContent({
          definition: 'A word',
          sort: null,
          synonymsToAvoid: [],
        }),
      ),
      approved(2, requirement(), [
        dependsOn('SC-1'),
        new KnowledgeLink(
          KnowledgeLinkType.UsesTerm,
          KnowledgeKey.parse('TERM-1'),
        ),
      ]),
      approved(
        2,
        new TermContent({
          definition: 'Alone',
          sort: null,
          synonymsToAvoid: [],
        }),
      ),
      approved(3, requirement({ type: 'non-functional' })),
      approved(
        1,
        new ConstraintContent({ constraint: 'EU only', imposedBy: null }),
      ),
      draft(
        3,
        new TermContent({
          definition: 'A Draft',
          sort: null,
          synonymsToAvoid: [],
        }),
      ),
    ];

    // Act
    const gaps = new KnowledgeGapService().findGaps(items);

    // Assert
    expect(describeGaps(gaps)).toEqual(['unlinked TERM-2']);
  });
});

function integration() {
  return {
    purpose: 'Payments',
    externalSystem: null,
    direction: null,
    exchanged: null,
  };
}
