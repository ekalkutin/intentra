import { describe, expect, it } from 'vitest';

import type { AnalysisRunDto } from '@intentra/contracts/workspace';

import { latestFindings } from './runs';

function run(
  id: string,
  status: AnalysisRunDto['status'],
  questionKeys: string[] = [],
): AnalysisRunDto {
  return {
    id,
    scope: 'whole-project',
    changedKeys: [],
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
