import { describe, expect, it } from 'vitest';

import { ProjectId, WorkspaceId } from '@intentra/shared-kernel';

import { AnalysisRunFinishedException } from '../exceptions/index.js';
import {
  AnalysisRunFailure,
  AnalysisRunScope,
  AnalysisRunStatus,
} from '../value-objects/index.js';

import { AnalysisRun } from './analysis-run.aggregate.js';

function startRun(): AnalysisRun {
  return AnalysisRun.start({
    workspaceId: new WorkspaceId().value,
    projectId: new ProjectId().value,
    scope: AnalysisRunScope.WholeProject,
    startedBy: null,
  });
}

describe('AnalysisRun', () => {
  it('starts running, with nothing found yet', () => {
    // Act
    const run = startRun();

    // Assert
    expect(run.status).toBe(AnalysisRunStatus.Running);
    expect(run.finishedAt).toBeNull();
    expect(run.questionKeys).toEqual([]);
  });

  it('completes with the questions it recorded, each once', () => {
    // Arrange
    const run = startRun();

    // Act
    run.complete({
      questionKeys: ['TBD-1', 'TBD-2', 'TBD-1'],
      stepLimitReached: true,
    });

    // Assert
    expect(run.status).toBe(AnalysisRunStatus.Completed);
    expect(run.questionKeys).toEqual(['TBD-1', 'TBD-2']);
    expect(run.stepLimitReached).toBe(true);
    expect(run.finishedAt).not.toBeNull();
  });

  it('fails keeping what it recorded before', () => {
    // Arrange
    const run = startRun();

    // Act
    run.fail(AnalysisRunFailure.AuditorFailed, ['TBD-3']);

    // Assert
    expect(run.status).toBe(AnalysisRunStatus.Failed);
    expect(run.failure).toBe(AnalysisRunFailure.AuditorFailed);
    expect(run.questionKeys).toEqual(['TBD-3']);
  });

  it('changes no more once finished', () => {
    // Arrange
    const run = startRun();
    run.complete({ questionKeys: [], stepLimitReached: false });

    // Act
    const failing = () => run.fail(AnalysisRunFailure.Interrupted);

    // Assert
    expect(failing).toThrow(AnalysisRunFinishedException);
  });
});
