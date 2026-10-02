import { describe, expect, it } from 'vitest';

import type {
  KnowledgeGapDto,
  KnowledgeGapRuleDto,
  KnowledgeKindDto,
} from '@intentra/contracts/workspace';

import { gapKeys, gapRulesOf, groupGapsByRule } from './gaps';

function gap(
  rule: KnowledgeGapRuleDto,
  key?: string,
  kind: KnowledgeKindDto = 'requirement',
): KnowledgeGapDto {
  return {
    rule,
    item: key ? { key, kind, title: key, status: 'approved' } : null,
  };
}

const gaps = [
  gap('no-goal'),
  gap('requirement-without-acceptance-criteria', 'REQ-2'),
  gap('scenario-without-requirement', 'SC-1', 'scenario'),
  gap('unlinked', 'REQ-1'),
  gap('unlinked', 'REQ-2'),
];

describe('groupGapsByRule', () => {
  it('groups every Gap under its rule, in the order of rules', () => {
    // Act
    const groups = groupGapsByRule(gaps, null);

    // Assert
    expect(
      groups.map(group => [group.rule, group.gaps.map(one => one.item?.key)]),
    ).toEqual([
      ['no-goal', [undefined]],
      ['requirement-without-acceptance-criteria', ['REQ-2']],
      ['scenario-without-requirement', ['SC-1']],
      ['unlinked', ['REQ-1', 'REQ-2']],
    ]);
  });

  it('keeps to one Kind, leaving out the Gaps of the Project as a whole', () => {
    // Act
    const groups = groupGapsByRule(gaps, 'scenario');

    // Assert
    expect(groups.map(group => group.rule)).toEqual([
      'scenario-without-requirement',
    ]);
  });
});

describe('gapRulesOf', () => {
  it('names the rules one item misses', () => {
    // Act
    const rules = gapRulesOf(gaps, 'REQ-2');

    // Assert
    expect(rules).toEqual([
      'requirement-without-acceptance-criteria',
      'unlinked',
    ]);
  });
});

describe('gapKeys', () => {
  it('names each item of the view once, in its order', () => {
    // Act
    const keys = gapKeys(gaps, null);

    // Assert
    expect(keys).toEqual(['REQ-2', 'SC-1', 'REQ-1']);
  });
});
