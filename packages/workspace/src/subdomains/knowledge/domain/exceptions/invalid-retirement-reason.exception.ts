import { DomainException } from '@intentra/shared-kernel';

export class InvalidRetirementReasonException extends DomainException<'INVALID_RETIREMENT_REASON'> {
  constructor() {
    super(
      'Retirement reason must be at most 2000 characters long',
      'INVALID_RETIREMENT_REASON',
    );
  }
}
