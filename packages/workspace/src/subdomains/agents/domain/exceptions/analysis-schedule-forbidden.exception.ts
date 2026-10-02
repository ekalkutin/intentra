import { ForbiddenException } from '@intentra/shared-kernel';

export class AnalysisScheduleForbiddenException extends ForbiddenException<'ANALYSIS_SCHEDULE_FORBIDDEN'> {
  constructor() {
    super(
      'Only a maintainer of the project can turn the nightly Analysis Run on or off',
      'ANALYSIS_SCHEDULE_FORBIDDEN',
    );
  }
}
