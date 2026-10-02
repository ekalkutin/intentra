import { ConflictException } from '@intentra/shared-kernel';

export class AnalysisRunFinishedException extends ConflictException<'ANALYSIS_RUN_FINISHED'> {
  constructor() {
    super('The Analysis Run has already finished', 'ANALYSIS_RUN_FINISHED');
  }
}
