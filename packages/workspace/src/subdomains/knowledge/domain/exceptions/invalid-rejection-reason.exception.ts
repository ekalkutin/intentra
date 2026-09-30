import { DomainException } from '@intentra/shared-kernel';

export class InvalidRejectionReasonException extends DomainException<'INVALID_REJECTION_REASON'> {
  constructor() {
    super(
      'Rejection reason must be at most 2000 characters long',
      'INVALID_REJECTION_REASON',
    );
  }
}
