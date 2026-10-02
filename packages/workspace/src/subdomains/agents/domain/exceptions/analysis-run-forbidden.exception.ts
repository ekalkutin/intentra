import { ForbiddenException } from '@intentra/shared-kernel';

export class AnalysisRunForbiddenException extends ForbiddenException<'ANALYSIS_RUN_FORBIDDEN'> {
  constructor() {
    super(
      'Only a contributor or maintainer of the project can start an Analysis Run',
      'ANALYSIS_RUN_FORBIDDEN',
    );
  }
}
