import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { TestingApp } from '@intentra/platform-testing';
import { ProjectId, UnitOfWork, WorkspaceId } from '@intentra/shared-kernel';

import { WorkspaceModule } from '../../../../workspace.module.js';
import { AnalysisRun } from '../../domain/entities/index.js';
import {
  AnalysisRunFailure,
  AnalysisRunScope,
  AnalysisRunStatus,
} from '../../domain/value-objects/index.js';
import { AnalysisRunBusyException } from '../exceptions/index.js';
import { AnalysisRunRepository } from '../ports/outbound/index.js';

import { AnalysisRunsService } from './analysis-runs.service.js';

function startRun(projectId = new ProjectId()): AnalysisRun {
  return AnalysisRun.start({
    workspaceId: new WorkspaceId().value,
    projectId: projectId.value,
    scope: AnalysisRunScope.WholeProject,
    startedBy: null,
  });
}

describe('AnalysisRunsService integration', () => {
  let app: TestingApp;

  beforeAll(async () => {
    app = await TestingApp.create({ imports: [WorkspaceModule.register({})] });
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  function save(run: AnalysisRun): Promise<void> {
    return app
      .get(UnitOfWork)
      .run(() => app.get(AnalysisRunRepository).save(run));
  }

  it('marks the runs a stopped process left running as interrupted, keeping what they recorded', async () => {
    // Arrange
    const left = startRun();
    await save(left);
    const done = startRun();
    done.complete({ questionKeys: ['TBD-1'], stepLimitReached: false });
    await save(done);

    // Act
    await app.get(AnalysisRunsService).onApplicationBootstrap();

    // Assert
    const runs = app.get(AnalysisRunRepository);
    const interrupted = await runs.getOne({ id: left.id });
    expect(interrupted.status).toBe(AnalysisRunStatus.Failed);
    expect(interrupted.failure).toBe(AnalysisRunFailure.Interrupted);
    const untouched = await runs.getOne({ id: done.id });
    expect(untouched.status).toBe(AnalysisRunStatus.Completed);
    expect(untouched.questionKeys).toEqual(['TBD-1']);
  });

  it('keeps one running run per Project, whoever saves the second', async () => {
    // Arrange
    const projectId = new ProjectId();
    await save(startRun(projectId));

    // Act
    const saving = save(startRun(projectId));

    // Assert
    await expect(saving).rejects.toBeInstanceOf(AnalysisRunBusyException);
  });
});
