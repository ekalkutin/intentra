import { DomainException } from '@intentra/shared-kernel';

export class InvalidRationaleException extends DomainException<'INVALID_RATIONALE'> {
  constructor() {
    super('Rationale must be 1 to 2000 characters long', 'INVALID_RATIONALE');
  }
}
