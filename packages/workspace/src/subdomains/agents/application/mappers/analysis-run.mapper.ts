import type {
  AnalysisRunDto,
  AnalysisRunFailureDto,
  AnalysisRunScopeDto,
  AnalysisRunStatusDto,
} from '@intentra/contracts/workspace';

import type { AnalysisRun } from '../../domain/entities/index.js';

import { toIsoString } from './instant.mapper.js';

export function toAnalysisRunDto(run: AnalysisRun): AnalysisRunDto {
  return {
    id: run.id.value,
    scope: run.scope.value as AnalysisRunScopeDto,
    status: run.status.value as AnalysisRunStatusDto,
    startedBy: run.startedBy?.value ?? null,
    startedAt: toIsoString(run.startedAt),
    finishedAt: run.finishedAt && toIsoString(run.finishedAt),
    agentsVersion: run.agentsVersion?.value ?? null,
    questionKeys: [...run.questionKeys],
    stepLimitReached: run.stepLimitReached,
    failure: (run.failure?.value ?? null) as AnalysisRunFailureDto | null,
  };
}
