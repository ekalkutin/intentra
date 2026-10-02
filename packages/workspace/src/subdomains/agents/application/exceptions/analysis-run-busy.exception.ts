import { ConflictException } from '@intentra/shared-kernel';

export class AnalysisRunBusyException extends ConflictException<'ANALYSIS_RUN_BUSY'> {
  constructor() {
    super(
      'An Analysis Run is already running in this Project',
      'ANALYSIS_RUN_BUSY',
    );
  }
}
