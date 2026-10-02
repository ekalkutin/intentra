import { describe, expect, it } from 'vitest';

import type { KnowledgeItemDto } from '@intentra/contracts/workspace';

import { planBulkApproval } from './bulk-approval';

/** A Draft the person may approve, depending on the given keys. */
function draft(
  key: string,
  dependsOn: readonly string[] = [],
  change: Partial<{ canApprove: boolean; needsReview: boolean }> = {},
): KnowledgeItemDto {
  return {
    key,
    version: 1,
    status: 'draft',
    needsReview: change.needsReview ?? false,
    links: dependsOn.map(target => ({ type: 'depends-on', key: target })),
    access: { canApprove: change.canApprove ?? true },
  } as unknown as KnowledgeItemDto;
}

describe('planBulkApproval', () => {
  it('approves the chosen Drafts with the Drafts they depend on, each once', () => {
    // Arrange
    const persona = draft('PER-1');
    const scenario = draft('SC-1', ['PER-1']);
    const rule = draft('BR-1', ['SC-1']);
    const other = draft('BR-2', ['SC-1', 'REQ-9']);

    // Act
    const plan = planBulkApproval(
      [rule, other],
      [persona, scenario, rule, other],
    );

    // Assert
    expect(plan.items).toEqual([
      { key: 'BR-1', version: 1 },
      { key: 'SC-1', version: 1 },
      { key: 'PER-1', version: 1 },
      { key: 'BR-2', version: 1 },
    ]);
    expect(plan.dependencies).toBe(2);
    expect(plan.blocked).toEqual([]);
  });

  it('leaves out what may not go, and what rests on it, saying why', () => {
    // Arrange
    const forbidden = draft('SC-1', [], { canApprove: false });
    const marked = draft('BR-1', [], { needsReview: true });
    const resting = draft('REQ-1', ['SC-1']);
    const free = draft('REQ-2');

    // Act
    const plan = planBulkApproval(
      [forbidden, marked, resting, free],
      [forbidden, marked, resting, free],
    );

    // Assert
    expect(plan.items).toEqual([{ key: 'REQ-2', version: 1 }]);
    expect(
      plan.blocked.map(({ item, reason, on }) => [item.key, reason, on]),
    ).toEqual([
      ['SC-1', 'forbidden', null],
      ['BR-1', 'needs-review', null],
      ['REQ-1', 'depends-on-blocked', 'SC-1'],
    ]);
  });

  it('approves a cycle together', () => {
    // Arrange
    const a = draft('REQ-1', ['REQ-2']);
    const b = draft('REQ-2', ['REQ-1']);

    // Act
    const plan = planBulkApproval([a], [a, b]);

    // Assert
    expect(plan.items.map(({ key }) => key)).toEqual(['REQ-1', 'REQ-2']);
  });
});
