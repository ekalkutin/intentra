import { describe, expect, it } from 'vitest';

import type { AnalysisRunDto } from '@intentra/contracts/workspace';

import { latestFindings, leftUnchecked, uncheckedCount } from './runs';

function run(
  id: string,
  status: AnalysisRunDto['status'],
  questionKeys: string[] = [],
  counts: Pick<AnalysisRunDto, 'itemCount' | 'checkedCount'> = {
    itemCount: 0,
    checkedCount: 0,
  },
): AnalysisRunDto {
  return {
    id,
    scope: 'unchecked',
    ...counts,
    status,
    startedBy: null,
    startedAt: '2026-10-03T00:00:00.000Z',
    finishedAt: null,
    agentsVersion: 1,
    questionKeys,
    stepLimitReached: false,
    failure: null,
  };
}

describe('latestFindings', () => {
  it('tells what the newest finished run found, past one still running', () => {
    // Arrange
    const runs = [
      run('new', 'running'),
      run('last', 'completed', ['TBD-2', 'TBD-3']),
      run('old', 'completed', ['TBD-1']),
    ];

    // Act
    const findings = latestFindings(runs);

    // Assert
    expect(findings?.id).toBe('last');
  });

  it('says nothing when the newest finished run found nothing', () => {
    // Arrange
    const runs = [run('last', 'completed'), run('old', 'completed', ['TBD-1'])];

    // Act
    const findings = latestFindings(runs);

    // Assert
    expect(findings).toBeNull();
  });
});

describe('leftUnchecked', () => {
  it('counts the items a failed run did not reach', () => {
    // Arrange
    const failed = run('failed', 'failed', [], {
      itemCount: 40,
      checkedCount: 12,
    });

    // Act
    const left = leftUnchecked(failed);

    // Assert
    expect(left).toBe(28);
  });

  it('leaves nothing over for a run still running', () => {
    // Arrange
    const running = run('running', 'running', [], {
      itemCount: 40,
      checkedCount: 12,
    });

    // Act
    const left = leftUnchecked(running);

    // Assert
    expect(left).toBe(0);
  });

  it('leaves nothing over for a failed run from before runs counted items', () => {
    // Arrange
    const old = run('old', 'failed');

    // Act
    const left = leftUnchecked(old);

    // Assert
    expect(left).toBe(0);
  });
});

describe('uncheckedCount', () => {
  it('tells how many items are still to check', () => {
    // Arrange
    const coverage = { checked: 412, total: 500 };

    // Act
    const unchecked = uncheckedCount(coverage);

    // Assert
    expect(unchecked).toBe(88);
  });
});
