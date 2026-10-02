import { DomainException } from '@intentra/shared-kernel';

export class InvalidAnalysisRunException extends DomainException<'INVALID_ANALYSIS_RUN'> {
  /** `reason` names the field and what it must be. */
  constructor(reason: string) {
    super(reason, 'INVALID_ANALYSIS_RUN');
  }
}
