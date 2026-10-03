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
    scope: AnalysisRunScope.Unchecked,
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

  it('counts the items it looks at and the questions recorded about them, each once', () => {
    // Arrange
    const run = startRun();
    run.plan(3);

    // Act
    run.checkOne(['TBD-1', 'TBD-2']);
    run.checkOne(['TBD-1']);

    // Assert
    expect(run.itemCount).toBe(3);
    expect(run.checkedCount).toBe(2);
    expect(run.questionKeys).toEqual(['TBD-1', 'TBD-2']);
  });

  it('fails keeping what it recorded and looked at before', () => {
    // Arrange
    const run = startRun();
    run.plan(2);
    run.checkOne(['TBD-3']);

    // Act
    run.fail(AnalysisRunFailure.ModelUnavailable);

    // Assert
    expect(run.status).toBe(AnalysisRunStatus.Failed);
    expect(run.failure).toBe(AnalysisRunFailure.ModelUnavailable);
    expect(run.questionKeys).toEqual(['TBD-3']);
    expect(run.checkedCount).toBe(1);
  });

  it('changes no more once finished', () => {
    // Arrange
    const run = startRun();
    run.complete();

    // Act
    const failing = () => run.fail(AnalysisRunFailure.Interrupted);

    // Assert
    expect(failing).toThrow(AnalysisRunFinishedException);
  });
});
